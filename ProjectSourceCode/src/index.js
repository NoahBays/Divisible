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

// * MISCELLANEOUS ENDPOINTS * //

// Dummy endpoint from lab 11
// * MISCELLANEOUS ENDPOINTS * //

// Dummy endpoint from lab 11
app.get("/welcome", (req, res) => {
  res.json({ status: "success", message: "Welcome!" });
});

// Home
// Home
app.get("/", (req, res) => {
  res.redirect("/register");
});

// Home
// Home
// GET
app.get("/home", (req, res) => {
  res.render("pages/home");
});

app.get("/test", (req, res) => {
  res.status(302).redirect("http://127.0.0.1:3000/login");
app.get("/home", (req, res) => {
  res.render("pages/home");
});

app.get("/test", (req, res) => {
  res.status(302).redirect("http://127.0.0.1:3000/login");
});

// Manage Account
app.get("/manageAccount", (req, res) => {
  res.render("pages/manageAccount");
});

// * GROUP ENDPOINTS * //

// Manage Account
app.get("/manageAccount", (req, res) => {
  res.render("pages/manageAccount");
});

// * GROUP ENDPOINTS * //

// createGroup
// GET
app.get("/createGroup", (req, res) => {
  res.render("pages/createGroup", {});
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

  // Create a new user
  await db.none("INSERT INTO users (username, password) VALUES ($1, $2)", [
    req.body.username,
    hash,
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
    const user = await db.oneOrNone("SELECT * FROM users WHERE username = $1", [
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
//* Payment window endpoints *// 
function updateUserWallet(username, amount) {
  return new Promise((resolve, reject) => {
    db.beginTransaction(err => {
      if (err) reject(err);
      const query = `UPDATE users SET wallet = wallet_balance + ? WHERE username = ?`;
      db.query(query, [amount, username], (error, results) => {
        if (error) {
          return db.rollback(() => reject(error));
        }
        db.commit(commitErr => {
          if (commitErr) {
            return db.rollback(() => reject(commitErr));
          }
          resolve(results);
        });
      });
    });
  });
}
app.post('/update-wallet', async (req, res) => {
  const { username, amount } = req.body;
  try {
    if(amount > 0){
      await updateUserWallet(username, amount);
      res.send('Wallet updated successfully!');
    }
    else{
      res.send('Payment Requested!');
    }
  } catch (error) {
    res.status(500).send('Failed to update wallet');
  }
});


//* Payment functionality * //
app.post('/payment-individual', async (req, res) => {
  const { chargeName, amount, senderUsername, recipientUsername, groupId } = req.body;
  // update wallet
  await updateUserWallet(senderUsername, -amount);
  await updateUserWallet(recipientUsername, amount);
  if(amount<0){
    chargeName += ' REQUESTED'
  }
  // Add a record to the transaction table
  const query = `
      INSERT INTO transactions_individual (charge_amount, charge_desc, date, sender_username, recipient_username, group_id)
      VALUES (?, ?, CURRENT_DATE, ?, ?, ?)
  `;
  await db.query(query, [amount, chargeName, senderUsername, recipientUsername, groupId]);
  // Redirect the user or send a response
  res.redirect('pages/home');
});
app.post('/payment-group', async (req, res) => {
  const { chargeName, amount, requesterUsername, groupId } = req.body;
  try {
    // Retrieve all members of the group
    const members = await db.query('SELECT username FROM group_members WHERE group_id = ?', [groupId]);
    if (members.length > 0) {
      const splitAmount = amount / members.length; // Equal split
      // Record the transaction for the requester
      let transactionQuery = `
        INSERT INTO transactions_group (charge_amount, charge_desc, date, requester_username, group_id)
        VALUES (?, ?, CURRENT_DATE, ?, ?)
      `;
      await db.query(transactionQuery, [amount, chargeName, requesterUsername, groupId]);
      // Update each member's wallet
      // will either request money to each individual or send money to each individual within the group
      members.forEach(async member => {
        if (member.username !== requesterUsername) { 
          await updateUserWallet(member.username, -splitAmount);
        }
      });
      res.redirect('pages/home');
    } else {
      res.status(400).send("No members found in the group.");
    }
  } catch (error) {
    console.error('Error processing group payment:', error);
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
module.exports = app.listen(3000);
console.log("Server is listening on port 3000");
