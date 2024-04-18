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

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});


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
      task.one("SELECT username, wallet FROM users WHERE username = $1", [req.session.user.username]), 
      task.any("SELECT * FROM friendships WHERE user_username = $1 ORDER BY user_username", [req.session.user.username]),
      task.any("SELECT * FROM groups WHERE group_admin_username = $1",[req.session.user.username]),
      task.any("SELECT * FROM group_members WHERE username = $1 ORDER BY username", [req.session.user.username]),
      task.any("SELECT * FROM transactions_individual WHERE sender_username = $1 OR recipient_username = $1 ORDER BY date", [req.session.user.username])
    ]);
  })
  .then(user_data => {
    const admin_members_arr = [];
    const not_admin_members_arr = [];
    const not_admin_arr = [];
    for(let i = 0; i < user_data[2].length; i++)
    {
      if(user_data[2])
      {
        db.any("SELECT * FROM group_members WHERE group_id = $1 ORDER BY group_id", [user_data[2][i].id])
        .then(admin_members_data => {
          for(let j = 0; j < admin_members_data.length; j++)
          {
            admin_members_arr.push(admin_members_data[j]);
          }
        })
        .catch(err => {console.log(err);res.redirect('/login');});
      }
    }
    for(let i = 0; i < user_data[3].length; i++)
    {
      if(user_data[3])
      {
        db.any("SELECT * FROM group_members WHERE group_id = $1 ORDER BY group_id", [user_data[3][i].group_id])
        .then(not_admin_members_data => {
          for(let j = 0; j < not_admin_members_data.length; j++)
          {
            not_admin_members_arr.push(not_admin_members_data[j]);
            // console.log("not_admin_members_arr = ", not_admin_members_arr);
          }
        })
        .catch(err => {console.log(err);res.redirect('/login');});
      }
    }
    for(let i = 0; i < user_data[3].length; i++)
    {
      if(user_data[3])
      {
        db.any("SELECT * FROM groups WHERE id = $1", [user_data[3][i].group_id])
        .then(not_admin_data => {
          for(let j = 0; j < not_admin_data.length; j++)
          {
            not_admin_arr.push(not_admin_data[j]);
            // console.log("not_admin_arr = ", not_admin_arr);
          }
        })
        .catch(err => {console.log(err);res.redirect('/login');});
      }
    }
    console.log("user_data[0] = ", user_data[0]);
    console.log("user_data[4] = ", user_data[4]);
    res.render("pages/home",{
      user: user_data[0],
      friendships: user_data[1],
      transactions: user_data[4],
      admin: user_data[2],
      admin_members: admin_members_arr,
      not_admin: not_admin_arr,
      not_admin_members: not_admin_members_arr
    });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});

app.get("/group", function (req, res) {
  // Fetch query parameters from the request object
  var current_id = req.query.id;
  var current_group_admin = req.query.group_admin_username;
  var current_user = req.session.user.username; //for differing views based on whether current user is group admin or not - currently not implemented

  // Multiple queries using templated strings
  var current_id = `select * from groups where id = '${current_id}';`;
  var current_group_admin = `select * from groups where group_admin_username = '${current_group_admin}';`;

  // use task to execute multiple queries
  db.task("get-everything", (task) => {
    return task.batch([task.any(current_id), task.any(current_group_admin)]);
  })
    // if query execution succeeds
    // query results can be obtained
    // as shown below
    .then((data) => {
      db.task("Find all group members of given group", function (task) {
        return task.any("SELECT * from group__members where group_id = $1", [
          current_id,
        ]);
      }).then((group_data) => {
        //Checks for valid data for group_id and group_admin_username
        if (data[0] && data[1]) {
          res.render("pages/group", {
            current_id: data[0],
            current_group_admin: data[1],
            group_members_data: group_data,
          });
        } else {
          res.render("pages/login"); //would like to return home upon unsuccessful attetmpt, not implemented yet
        }
      });
    });
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
// Post
app.post("/createGroup", async (req, res) => {
  const { group_name } = req.body;
  const group_admin = req.session.user.username; // or from req.body, depending on your setup

  try {
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
    res.json({ status: 400, message: "Failed to create group" });
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
  await db.none("INSERT INTO users (username, password, wallet) VALUES ($1, $2, $3)", [
    req.body.username,
    hash,
    money
  ]);

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

//* PAYMENT WINDOW UI ENDPOINTS *//
function updateUserWallet(username, amount) {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) reject(err);
      const query = `UPDATE users SET wallet = wallet_balance + ? WHERE username = ?`;
      db.query(query, [amount, username], (error, results) => {
        if (error) {
          return db.rollback(() => reject(error));
        }
        db.commit((commitErr) => {
          if (commitErr) {
            return db.rollback(() => reject(commitErr));
          }
          resolve(results);
        });
      });
    });
  });
}
app.post("/update-wallet", async (req, res) => {
  const { username, amount } = req.body;
  try {
    if (amount > 0) {
      await updateUserWallet(username, amount);
      res.send("Wallet updated successfully!");
    } else {
      res.send("Payment Requested!");
    }
  } catch (error) {
    res.status(500).send("Failed to update wallet");
  }
});

//* PAYMENT FUNCTIONALITY ENDPOINTS *//
app.post("/payment-individual", async (req, res) => {
  const { chargeName, amount, senderUsername, recipientUsername, groupId } =
    req.body;
  // update wallet
  await updateUserWallet(senderUsername, -amount);
  await updateUserWallet(recipientUsername, amount);
  if (amount < 0) {
    chargeName += " REQUESTED";
  }
  // Add a record to the transaction table
  const query = `
      INSERT INTO transactions_individual (charge_amount, charge_desc, date, sender_username, recipient_username, group_id)
      VALUES (?, ?, CURRENT_DATE, ?, ?, ?)
  `;
  await db.query(query, [
    amount,
    chargeName,
    senderUsername,
    recipientUsername,
    groupId,
  ]);
  // Redirect the user or send a response
  res.redirect("pages/home");
});
app.post("/payment-group", async (req, res) => {
  const { chargeName, amount, requesterUsername, groupId } = req.body;
  try {
    // Retrieve all members of the group
    const members = await db.query(
      "SELECT username FROM group_members WHERE group_id = ?",
      [groupId]
    );
    if (members.length > 0) {
      const splitAmount = amount / members.length; // Equal split
      // Record the transaction for the requester
      let transactionQuery = `
        INSERT INTO transactions_group (charge_amount, charge_desc, date, requester_username, group_id)
        VALUES (?, ?, CURRENT_DATE, ?, ?)
      `;
      await db.query(transactionQuery, [
        amount,
        chargeName,
        requesterUsername,
        groupId,
      ]);
      // Update each member's wallet
      // will either request money to each individual or send money to each individual within the group
      members.forEach(async (member) => {
        if (member.username !== requesterUsername) {
          await updateUserWallet(member.username, -splitAmount);
        }
      });
      res.redirect("pages/home");
    } else {
      res.status(400).send("No members found in the group.");
    }
  } catch (error) {
    console.error("Error processing group payment:", error);
    res.status(500).send("Failed to process payment.");
  }
});

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
