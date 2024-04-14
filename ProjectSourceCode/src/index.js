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
const { group } = require("console");

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: "hbs",
  layoutsDir: __dirname + "/views/layouts",
  partialsDir: __dirname + "/views/partials",
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

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here

// dummy route from lab 11
app.get("/welcome", (req, res) => {
  res.json({ status: "success", message: "Welcome!" });
});

app.get("/", (req, res) => {
  res.redirect("/register");
});

// Register
// GET
app.get("/register", (req, res) => {
  res.render("pages/register", {});
});

// createGroup
// GET
app.get("/createGroup", (req, res) => {
  res.render("pages/createGroup", {username: req.session.username });
});

// createGroup
// Post
app.post("/createGroup", async (req, res) => {
  const { groupName } = req.body;
  const username = req.session.user.username; // or from req.body, depending on your setup

  try {
    const maxIdResult = await db.one("SELECT MAX(id) FROM groups;");
    const newId = maxIdResult.max + 1;

    // Insert the new group into the 'groups' table
    const query = "INSERT INTO groups (id, group_admin_username, group_name) VALUES ($1, $2, $3);";
    await db.none(query, [newId, username, groupName]);

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
    WHERE friendships.username = $1 AND users.username LIKE $2
  `;

  const friends = await db.any(query, [username, '%' + searchQuery + '%']);

  res.json(friends);
});

let usersToAdd = [];

app.post("/addUserToGroup", (req, res) => {
  const { username, groupName } = req.body;

  // Add the user to the list of users to be added to the group
  usersToAdd.push({ username, groupName });

  res.json({ status: "success", message: `${username} will be added to group` });
});

app.post("/addGroupMembers", async (req, res) => {
  const { groupName, usernames } = req.body;
  db.one('SELECT id FROM groups WHERE group_name = $1', [groupName])
  .then(data => {
    console.log(data.id); // this will log the group id
  })
  .catch(error => {
    console.error(error);
  });

  try {
    // Start a database transaction
    await db.tx(async t => {
      // For each username in the array, insert a new row in the group_members table
      for (const username of usernames) {
        await t.none("INSERT INTO group_members (group_id, username) VALUES ($1, $2)", [data.id, username]);
      }
    });

    res.json({ status: 200, message: "Group members added successfully" });
  } catch (error) {
    console.error(error);
    res.json({ status: 400, message: "Failed to add group members" });
  }
});


// createGroup
// GET
app.get("/addFriends", (req, res) => {
  res.render("pages/addFriends", {});
});

// POST Register
// app.post("/register", async (req, res) => {
//   console.log(req.body);
//   //hash the password using bcrypt library
//   // const hash = await bcrypt.hash(req.body.password, 10);

//   try {
//     // Insert username and hashed password into the 'users' table
//     if (
//       typeof req.body.username === undefined ||
//       typeof req.body.password === undefined
//     ) {
//       console.log("reached");
//       throw new Error("Invalid input");
//     }

//     await db.none("INSERT INTO users (username, password) VALUES ($1, $2)", [
//       req.body.username,
//       req.body.password,
//     ]);

//     res.json({ status: 200, message: "Success" });
//   } catch (error) {
//     console.error(error);
//     res.json({ status: 400, message: "Invalid input" });
//   }
// });

app.post("/register", async (req, res) => {
  if (req.body.password && req.body.username) {
    const hash = await bcrypt.hash(req.body.password, 10);

    const query = "INSERT INTO users (username, password) VALUES ($1, $2);";
    db.any(query, [req.body.username, hash])
      .then((data) => {
        //res.json({ status: 200, message: "Success" });
        res.redirect("/login");
        console.log("Registered successfully");
      })
      .catch((err) => {
        //res.json({ status: 400, message: "Invalid input" });
        res.redirect("/register");
        console.log("Invalid input");
      });
  } else {
    //res.json({ status: 400, message: "No input provided" });
    res.redirect("/register");
    console.log("No input provided");
  }
});

// Login
// GET
app.get("/login", (req, res) => {
  res.render("pages/login");
});

// POST
app.post("/login", async (req, res) => {
  try {
    // Find the user from the users table where the username is the same as the one entered by the user
    const user = await db.oneOrNone("SELECT * FROM users WHERE username = $1", [
      req.body.username,
    ]);

    if (user) {
      // Use bcrypt.compare to encrypt the password entered from the user and compare if the entered password is the same as the registered one
      const match = await bcrypt.compare(req.body.password, user.password);
      console.log("User found");

      if (match) {
        // Save the user in the session variable
        req.session.user = user;
        req.session.save();
        console.log("Password matched successfully");

        // Redirect to /discover route after setting the session
        res.redirect("/home");
        console.log("Logged in successfully");
      } else {
        // If the password doesn't match, render the login page and send a message to the user stating "Incorrect username or password"
        res.render("pages/login", {
          message: "Incorrect username or password",
        });
        console.log("Password match unsuccessful");
      }
    } else {
      // If the user is not found in the table, redirect to GET /register route
      res.redirect("/register");
      console.log("User not found");
    }
  } catch (error) {
    console.error(error);
    // If an error occurs, render the login page and send a generic error message
    res.render("pages/login", { message: "An error occurred" });
    console.log("An error has occurred");
  }
});

// Logout
// GET
app.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy();
  // render lgoout page
  res.redirect("/login");
});

// Home
// GET
app.get('/home', (req, res) => {
//Find user, friendships, if user is an admin in any groups, members user is a part of
db.task('Find user, friends, admins, and group members', function(task){
  return task.batch([
    task.one("SELECT * FROM users WHERE username = $1", [req.session.user.username]), 
    task.any("SELECT * FROM friendships WHERE username = $1", [req.session.user.username]),
    task.oneOrNone("SELECT * FROM groups WHERE group_admin_username = $1",[req.session.user.username]),
    task.any("SELECT * FROM group_members WHERE username = $1", [req.session.user.username])
  ]);
})
  .then(user_data => {
//Checks for null values for admin status and group member status
console.log("user_data[2] = ",user_data[2]);
console.log("user_data[3] = ",user_data[3]);
if(!user_data[2] && !user_data[3])
    {
      res.render("pages/home",{
        friendships: user_data[1]
      });
    }
    else
    {
      //Find groups where user is not admin and find the admin of that group
      db.task('Find group members when user is admin and when user is not admin', function(task){
        return task.batch([
          task.any("SELECT * FROM groups WHERE id = $1", [user_data[3][0].group_id]),
          task.any("SELECT * FROM group_members WHERE group_id = $1", [user_data[3][0].group_id])
        ]);
      })
      .then(group_data => {
        //If user is an admin in a group
        if(user_data[2])
        {
          db.any("SELECT * FROM group_members WHERE group_id = $1", [user_data[2].id])
          .then(admin_data => {
            res.render("pages/home",{
            //If all goes right, send to home page with data
              friendships: user_data[1],
              user_is_admin: user_data[2],
              user_is_admin_members: admin_data,
              user_is_not_admin: group_data[0][0],
              user_is_not_admin_members: group_data[1]
            });
          })
          .catch(err => {console.log(err);res.redirect('/login');});
        }
        else
        {
          //Send to home page with data; user is not an admin
            res.render("pages/home",{
              friendships: user_data[1],
              user_is_admin: user_data[2],
              user_is_not_admin: group_data[0][0],
              user_is_not_admin_members: group_data[1],
            });
        }
      })
      .catch(err => {console.log(err);res.redirect('/login');});
    }
  })
  .catch(err => {console.log(err);res.redirect('/login');});
});


/*
//Find user in users table
  db.one("SELECT * FROM users WHERE username = $1", [req.session.user.username])
    .then(data => {
console.log("Data: ", data);
//Find all friendships under user
      db.any("SELECT * FROM friendships WHERE username = $1", [data.username])
      .then(data2 => {
console.log("Data2: ", data2);
        res.render("pages/home", {
          friendships: data2
        })
      })
      .catch(err =>{
        console.log(err);
        res.render('pages/login');
      });
    })
    .catch(err => {
      console.log(err);
      res.render('pages/login');
    });
});
*/

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
