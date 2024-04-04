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

// POST
app.post("/register", async (req, res) => {
  try {
    // Hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);

    // Insert username and hashed password into the 'users' table
    await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      req.body.username,
      hash,
    ]);

    // Redirect to GET /login route page after data has been inserted successfully
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    // If the insert fails, redirect to GET /register route
    res.redirect("/register");
  }
});

// Login
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
        res.redirect("/discover");
      } else {
        // If the password doesn't match, render the login page and send a message to the user stating "Incorrect username or password"
        res.render("pages/login", {
          message: "Incorrect username or password",
        });
      }
    } else {
      // If the user is not found in the table, redirect to GET /register route
      res.redirect("/register");
    }
  } catch (error) {
    console.error(error);
    // If an error occurs, render the login page and send a generic error message
    res.render("pages/login", { message: "An error occurred" });
  }
});

// Logout
// GET
app.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy();
  // render lgoout page
  res.render("pages/logout", { message: "Successfully Logged Out." });
});

// Home
// GET
app.get("/home", (req, res) => {
  res.render("pages/home");
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log("Server is listening on port 3000");
