// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************
const express = require("express"); // To build an application server or API
const app = express();
const handlebars = require("express-handlebars");
const Handlebars = require("handlebars");
const path = require("path");
const pgp = require("pg-promise")(); // To connect to the Postgres DB from the node server
const bodyParser = require("body-parser");
const session = require("express-session"); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require("bcrypt"); //  To hash passwords
const axios = require("axios"); // To make HTTP requests from our server. We'll learn more about it in Part C.

Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerPartial("registerForm", "{{> registerForm}}");

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: "hbs",
  layoutsDir: __dirname + "/views/layouts",
  partialsDir: __dirname + "/views/partials",
  // imageDir: __dirname + "/public/images",
});

// database configuration
const dbConfig = {
  host: "db", // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then((obj) => {
    console.log("Database connection successful"); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Serve static image files
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Serve static font files
app.use("/fonts", express.static(path.join(__dirname, "public/fonts")));

// Serve static css files

// We create the user variable up here and populate it after the fact so that we can access it in /manageAccount as well as set it in /login
let user;

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here

// * MISCELLANEOUS ENDPOINTS * //

// Dummy endpoint from lab 11
app.get("/welcome", (req, res) => {
  res.json({ status: "success", message: "Welcome!" });
});

// Dummy endpoint from lab 11
app.get("/", (req, res) => {
  res.redirect("/register");
});

// Home
// GET
app.get("/home", (req, res) => {
  //Find user, friendships, if user is an admin in any groups, members user is a part of
  db.task("Find user, friends, admins, and group members", function (task) {
    return task.batch([
      task.one("SELECT username, wallet FROM users WHERE username = $1", [
        req.session.user.username,
      ]),
      task.any(
        "SELECT * FROM friendships WHERE user_username = $1 ORDER BY user_username",
        [req.session.user.username]
      ),
      task.any("SELECT * FROM groups WHERE group_admin_username = $1", [
        req.session.user.username,
      ]),
      task.any(
        "SELECT * FROM group_members WHERE username = $1 ORDER BY username",
        [req.session.user.username]
      ),
      task.any(
        "SELECT * FROM transactions_individual WHERE sender_username = $1 OR recipient_username = $1 ORDER BY date DESC",
        [req.session.user.username]
      ),
    ]);
  })
    .then((user_data) => {
      const admin_members_arr = [];
      const not_admin_members_arr = [];
      const not_admin_arr = [];
      for (let i = 0; i < user_data[2].length; i++) {
        if (user_data[2]) {
          db.any(
            "SELECT * FROM group_members WHERE group_id = $1 ORDER BY group_id",
            [user_data[2][i].id]
          )
            .then((admin_members_data) => {
              for (let j = 0; j < admin_members_data.length; j++) {
                admin_members_arr.push(admin_members_data[j]);
              }
            })
            .catch((err) => {
              console.log(err);
              res.redirect("/login");
            });
        }
      }
      for (let i = 0; i < user_data[3].length; i++) {
        if (user_data[3]) {
          db.any(
            "SELECT * FROM group_members WHERE group_id = $1 ORDER BY group_id",
            [user_data[3][i].group_id]
          )
            .then((not_admin_members_data) => {
              for (let j = 0; j < not_admin_members_data.length; j++) {
                not_admin_members_arr.push(not_admin_members_data[j]);
                // console.log("not_admin_members_arr = ", not_admin_members_arr);
              }
            })
            .catch((err) => {
              console.log(err);
              res.redirect("/login");
            });
        }
      }
      for (let i = 0; i < user_data[3].length; i++) {
        if (user_data[3]) {
          db.any("SELECT * FROM groups WHERE id = $1", [
            user_data[3][i].group_id,
          ])
            .then((not_admin_data) => {
              for (let j = 0; j < not_admin_data.length; j++) {
                not_admin_arr.push(not_admin_data[j]);
                // console.log("not_admin_arr = ", not_admin_arr);
              }
            })
            .catch((err) => {
              console.log(err);
              res.redirect("/login");
            });
        }
      }
      console.log("user_data[0] = ", user_data[0]);
      console.log("user_data[4] = ", user_data[4]);
      res.render("pages/home", {
        user: user_data[0],
        friendships: user_data[1],
        transactions: user_data[4],
        admin: user_data[2],
        admin_members: admin_members_arr,
        not_admin: not_admin_arr,
        not_admin_members: not_admin_members_arr,
      });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});

// viewUser

app.get("/viewUser/:username", async (req, res) => {
  const loggedInUsername = req.session.user.username;
  const visitingUsername = req.params.username;
  const friendship = await db.manyOrNone(
    "SELECT * FROM friendships WHERE (user_username = $1 AND friend_username = $2) OR (user_username = $2 AND friend_username = $1)",
    [loggedInUsername, visitingUsername]
  );
  const isFriend = !!friendship;
  
  // Fetch the user data of the visiting user
  const visitingUser = await db.oneOrNone("SELECT * FROM users WHERE username = $1", [visitingUsername]);
  const balanceRow = await db.oneOrNone("SELECT outstanding_balance FROM friendships WHERE user_username = $1 AND friend_username = $2", [loggedInUsername, visitingUsername]);
  const outstanding_balance = balanceRow ? balanceRow.outstanding_balance : null;
  res.render("pages/viewUser", { friend: visitingUser, balance: outstanding_balance, isFriend });
});

app.get("/group/:group_name", async (req, res) => {
  // Fetch query parameters from the request object
  const name = req.params.group_name; //for differing views based on whether current user is group admin or not - currently not implemented
  const currentGroup = await db.oneOrNone("SELECT * FROM groups WHERE group_name = $1", [name]);
  // Multiple queries using templated strings
  const current_id = currentGroup.id;
  const currentGroupMembers = await db.manyOrNone("SELECT * FROM group_members WHERE group_id = $1", [current_id]);
  const transactions = await db.any("SELECT * FROM transactions_group WHERE group_id = $1 ORDER BY date DESC", [current_id]);

  // use task to execute multiple queries
        //Checks for valid data for group_id and group_admin_username
        if (currentGroup != null) {
          res.render("pages/group", {group: currentGroup, groupMembers: currentGroupMembers, transactions: transactions});
        } else {
          res.render("pages/login"); //would like to return home upon unsuccessful attetmpt, not implemented yet
        }
  // if query execution fails
  // send error message
  /*.catch(err => {
        console.log('Uh Oh spaghettio');
        console.log(err);
        res.status('400').json({
          current_id: '',
          current_group_admin: '',
          error: err,
        });
      });*/
});

app.get("/test", (req, res) => {
  res.status(302).redirect("http://127.0.0.1:3000/login");
});
app.get("/home", (req, res) => {
  res.render("pages/home");
});

app.get("/test", (req, res) => {
  res.status(302).redirect("http://127.0.0.1:3000/login");
});

// Manage Account
app.get("/manageAccount", (req, res) => {
  res.render("pages/manageAccount", { user: user });
});

// * GROUP ENDPOINTS * //

// createGroup
// GET
app.get("/createGroup", (req, res) => {
  res.render("pages/createGroup", { username: req.session.username });
});

// createGroup
app.post("/createGroup", async (req, res) => {
  const { group_name } = req.body;
  const group_admin = req.session.user.username; // or from req.body, depending on your setup

  try {
    // Check if a group with the same name and admin already exists
    const existingGroup = await db.oneOrNone("SELECT * FROM groups WHERE group_admin_username = $1 AND group_name = $2", [group_admin, group_name]);

    if (existingGroup) {
      // If the group already exists, send an error message
      return res.json({ status: 400 });
    }

    // If the group doesn't exist, continue with the group creation process
    const maxIdResult = await db.one("SELECT MAX(id) FROM groups;");
    if (maxIdResult.max == null) {
      maxIdResult.max = 0;
    }

    const newId = maxIdResult.max + 1;

    // Insert the new group into the 'groups' table
    const query =
      "INSERT INTO groups (id, group_admin_username, group_name) VALUES ($1, $2, $3);";
    await db.none(query, [newId, group_admin, group_name]);

    res.json({ status: 200, message: "Group created successfully" });
  } catch (error) {
    console.error(error);
    res.json({ status: 401 });
  }
});

app.get("/searchFriends", async (req, res) => {
  const searchQuery = req.query.q;
  const username = req.session.username;

  const query = `
    SELECT users.*
    FROM users
    INNER JOIN friendships ON users.username = friendships.friend_username
    WHERE friendships.user_username = $1 AND users.username LIKE $2
  `;

  const friends = await db.any(query, [username, "%" + searchQuery + "%"]);

  res.json(friends);
});

let usersToAdd = [];

app.post("/addUserToGroup", async (req, res) => {
  try {
    const { friend_username, groupName } = req.body;
    const user_username = req.session.user.username;

    // Check if a friendship exists between the current user and the user they are trying to add
    const friendshipExists = await db.one(
      "SELECT * FROM friendships WHERE user_username = $1 AND friend_username = $2",
      [user_username, friend_username]
    );

    if (friendshipExists) {
      // Add the user to the list of users to be added to the group
      usersToAdd.push({ friend_username, groupName });
      res.json({
        status: "success",
      });
    }
  } catch (error) {
    res.json({
      status: "error",
    });
  }
});

app.post("/addGroupMembers", async (req, res) => {
  const { groupName, groupMembers } = req.body;

  db.one("SELECT id FROM groups WHERE group_name = $1", [groupName])
    .then(async (data) => {
      console.log(data.id); // this will log the group id
      let groupId = data.id;

      try {
        // Start a database transaction
        await db.tx(async (t) => {
          // For each username in the array, insert a new row in the group_members table
          for (const username of groupMembers) {
            await t.none(
              "INSERT INTO group_members (group_id, username) VALUES ($1, $2)",
              [groupId, username]
            );
          }
        });

        res.json({ status: "success" });
      } catch (error) {
        console.error(error);
        res.json({ status: 400, message: "Failed to add group members" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.json({ status: 400, message: "Failed to add group members" });
    });
});

// createGroup
// GET
app.get("/addFriends", (req, res) => {
  res.render("pages/addFriends", {});
});
app.get("/paymentWindow", (req, res) => {
  res.render("pages/paymentWindow", {});
});

// * REGISTER ENDPOINTS * //
// GET
app.get("/register", (req, res) => {
  res.render("pages/register", {});
});

// POST Register
app.post("/register", async (req, res) => {
  // Get the user data from the request body
  const { username, password } = req.body;

  // Validate the user data
  if (!username || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check if the user already exists
  const existingUser = await db.oneOrNone(
    "SELECT * FROM users WHERE username = $1",
    [req.body.username]
  );
  if (existingUser) {
    //return res.status(400).json({ error: "User already exists" });
    res
      .status(400)
      .render("pages/register", { message: "User already exists" });
    return;
  }

  // Password Hashing
  const hash = await bcrypt.hash(req.body.password, 10);
  var money = 0;

  // Create a new user
  await db.none(
    "INSERT INTO users (username, password, wallet) VALUES ($1, $2, $3)",
    [req.body.username, hash, money]
  );

  // Send a success response
  res
    .status(200)
    .render("pages/login", { message: "User created successfully" });
});

// * LOGIN ENDPOINTS * //

// GET
app.get("/login", (req, res) => {
  res.render("pages/login", {});
});

// POST
app.post("/login", async (req, res) => {
  try {
    // Find the user from the users table where the username is the same as the one entered by the user
    user = await db.oneOrNone("SELECT * FROM users WHERE username = $1", [
      req.body.username,
    ]);

    if (user) {
      // Use bcrypt.compare to encrypt the password entered from the user and compare if the entered password is the same as the registered one
      const match = await bcrypt.compare(req.body.password, user.password);

      if (match) {
        // Save the user in the session variable
        req.session.user = user;
        req.session.save();

        // Redirect to /discover route after setting the session
        console.log("match");
        res.redirect("/home");
      } else {
        // If the password doesn't match, render the login page and send a message to the user stating "Incorrect username or password"
        res.render("pages/login", {
          message: "Incorrect username or password",
        });
      }
    } else {
      console.log("register");
      // If the user is not found in the table, redirect to GET /register route
      res.redirect("/register");
    }
  } catch (error) {
    console.error(error);
    // If an error occurs, render the login page and send a generic error message
    res.render("pages/login", { message: "An error occurred" });
  }
});
app.post('/payment-individual', async (req, res) => {
  const { chargeName, amount, senderUsername, recipientUsername, group_name, payback } = req.body;

  // Validate input
  if (amount <= 0) {
    return res.status(400).send('Invalid amount specified.');
  }

  try {
    await db.tx(async t => {
      const senderResult = await updateUserWallet(senderUsername, -amount, t);
      if (!senderResult) {
        throw new Error('Failed to update sender\'s wallet or user not found');
      }

      const recipientResult = await updateUserWallet(recipientUsername, amount, t);
      if (!recipientResult) {
        throw new Error('Failed to update recipient\'s wallet or user not found');
      }
      if (payback === 'yes') {
        const friend_result1=await updateFriendshipBalance(senderUsername, recipientUsername, amount, t);
        if (!friend_result1) {
          throw new Error('Failed to update outstanding balance sender');
        }
        const friend_result2=await updateFriendshipBalance(recipientUsername, senderUsername, -amount, t);
        if (!friend_result2) {
          throw new Error('Failed to update outstanding balance reciever');
        }
    }
      if (group_name) {
        const groupResult = await updateGroupMemberBalance(group_name, recipientUsername, amount, t);
        if(!groupResult){
          throw new Error('Oustanding Balance not updated');
        }
      }

      const transactionQuery = `
        INSERT INTO transactions_individual (charge_amount, charge_desc, date, sender_username, recipient_username, group_name)
        VALUES ($1, $2, CURRENT_DATE, $3, $4, $5)
      `;
      await t.none(transactionQuery, [amount, chargeName, senderUsername, recipientUsername, group_name || null]);
    });

    res.redirect('/home');
  } catch (error) {
    console.error('Payment transaction failed:', error);
    res.status(500).send('Failed to complete payment transaction');
  }
});

async function updateUserWallet(username, amount, transaction) {
  const query = 'UPDATE users SET wallet = wallet + $1 WHERE username = $2 RETURNING *';
  const res = await transaction.oneOrNone(query, [amount, username]);
  return res;
}
async function updateFriendshipBalance(user_username, friend_username, amount, t) {
  try {
      const existingBalance = await t.oneOrNone(
          'SELECT outstanding_balance FROM friendships WHERE user_username = $1 AND friend_username = $2',
          [user_username, friend_username]
      );
      if(amount>=-existingBalance && amount>0){
        amount=-existingBalance;
      }
      if(amount<=-existingBalance && amount<0){
        amount = -existingBalance;
      }

      await t.none(
        'UPDATE friendships SET outstanding_balance = outstanding_balance + $1 WHERE user_username = $2 AND friend_username = $3',
        [amount, user_username, friend_username]
         );

      return { success: true };
  } catch (error) {
      console.error('Error updating friendship balance:', error);
      throw error; // Rethrow the error to be handled by the caller
  }
}

async function updateGroupMemberBalance(groupName, username, amount, t) {
  try {
    const groupIdResult = await t.oneOrNone('SELECT id FROM groups WHERE group_name = $1', [groupName]);
    if (!groupIdResult) {
      throw new Error('Group not found');
    }
    const groupId = groupIdResult.id;

    const updateQuery = `
      UPDATE group_members
      SET outstanding_balance = outstanding_balance + $1
      WHERE group_id = $2 AND username = $3
    `;
    await t.none(updateQuery, [amount, groupId, username]);
    return { success: true };
  } catch (error) {
    console.error('Error updating group member balance:', error);
    throw error;
  }
}

// * LOGOUT ENDPOINTS * //

// GET
app.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy();
  // render lgoout page
  res.render("pages/login", { message: "Successfully Logged Out." });
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests

module.exports = app.listen(3000, () => {
  /*const insertTestFriendships = `
    INSERT INTO friendships (username, friend_username)
    VALUES ('a', 'c');
  `;
  db.none(insertTestFriendships)
    .then(() => {
      console.log('Test friendships inserted successfully');
    })
    .catch(error => {
      console.error('Failed to insert test friendships:', error);
    });*/

  console.log("Server is listening on port 3000");
});