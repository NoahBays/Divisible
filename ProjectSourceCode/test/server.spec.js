/*
// ********************** Initialize server **********************************

const server = require("../src/index");

// ********************** Import Libraries ***********************************

const chai = require("chai"); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;
// test/some-test-file.js

// ... write your tests ...
// test/some-test-file.js

// ... write your tests ...

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe("Server!", () => {
  // Sample test case given to test / endpoint.
  it("Returns the default welcome message", (done) => {
    chai
      .request(server)
      .get("/welcome")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals("success");
        assert.strictEqual(res.body.message, "Welcome!");
        done();
      });
  });
});
/*
// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

//We are checking POST /add_user API by passing the user info in in incorrect manner (name cannot be an integer). This test case should pass and return a status 400 along with a "Invalid input" message.

describe("Testing /register API endpoint", () => {
  it("Positive : /register", (done) => {
    chai
      .request(server)
      .post("/register")
      .send({ username: "John Doe", password: "password" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        // expect(res.body.message).to.equals("User created successfully");
        // expect(res.body.message).to.equals("User created successfully");
        done();
      });
  });

  // Example Negative Testcase :
  // API: /register
  // Input: {id: 5, name: 10, dob: '2020-02-20'}
  // Expect: res.status == 400 and res.body.message == 'Invalid input'
  // Result: This test case should pass and return a status 400 along with a "Invalid input" message.
  // Explanation: The testcase will call the /add_user API with the following invalid inputs
  // and expects the API to return a status of 400 along with the "Invalid input" message.
  it("Negative : /register. Checking invalid name", (done) => {
    chai
      .request(server)
      .post("/register")
      .send({ id: "5", name: 10, dob: "2020-02-20" })
      .end((err, res) => {
        expect(res).to.have.status(400);
        // expect(res.body.error).to.equals("Missing required fields");
        done();
      });
  });
});

describe("Testing Redirect", () => {
  // Sample test case given to test /test endpoint.
  it("\test route should redirect to /login with 302 HTTP status code", (done) => {
    chai
      .request(server)
      .get("/test")
      .redirects(0)
      .end((err, res) => {
        expect(res).to.have.status(302); // Expecting a redirect status code
        res.should.redirectTo(/^.*127\.0\.0\.1.*\/login$/); // Expecting a redirect to /login with the mentioned Regex
        done();
      });
  });
});

describe("Testing Render", () => {
  // Sample test case given to test /test endpoint.
  it('test "/login" route should render with an html response', (done) => {
    chai
      .request(server)
      .get("/login") // for reference, see lab 8's login route (/login) which renders home.hbs
      .end((err, res) => {
        res.should.have.status(200); // Expecting a success status code
        res.should.be.html; // Expecting a HTML response
        done();
      });
  });
});

// describe("Login Endpoint", () => {
//   // Positive case
//   it("should log in successfully with correct credentials", (done) => {
//     const userCredentials = { username: "John Doe", password: "password" };
//     chai
//       .request(server)
//       .post("/login")
//       .send(userCredentials)
//       .end((err, res) => {
//         console.log(res.status);
//         res.should.redirectTo(/^.*127\.0\.0\.1.*\/discover$/);
//         done();
//       });
//   });

//   // Negative case
//   it("should fail to log in with incorrect credentials", (done) => {
//     const userCredentials = {
//       username: "nonExistingUser",
//       password: "wrongPassword",
//     };
//     chai
//       .request(server)
//       .post("/login")
//       .send(userCredentials)
//       .end((err, res) => {
//         res.should.redirectTo(/^.*127\.0\.0\.1.*\/register$/);
//         done();
//       });
//   });
// });
//
*/