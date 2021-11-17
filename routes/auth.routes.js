const router = require("express").Router();
const User = require("./../models/User.model");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const isLoggedIn = require("./../middleware/isLoggedIn");

// ROUTES

router.get("/signup", (req, res) => {
  res.render("auth/signup-form");
});

// POST /signup

router.post("/signup", (req, res) => {
  const { username, password } = req.body;

  // checking if the username and password are provided;
  console.log("username :>> ", username);
  console.log("password :>> ", password);

  const usernameNotProvided = !username || username === "";
  const passwordNotProvided = !password || password === "";

  if (usernameNotProvided || passwordNotProvided) {
    console.log("missing username or password");
    res.render("auth/signup-form", {
      errorMessage: "Provide username and password.",
    });

    return;
  }

  User.findOne({ username: username })
    .then((foundUser) => {
      if (foundUser) {
        throw new Error("Username already exists.");
      }

      return bcrypt.genSalt(saltRounds);
    })
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hashedPassword) => {
      return User.create({ username, password: hashedPassword });
    })
    .then((createdUser) => {
      res.redirect("login");
    })
    .catch((err) => {
      res.render("auth/signup-form", {
        errorMessage: "Error while trying to sign up",
      });
    });
});

// GET login
router.get("/login", (req, res) => {
  res.render("auth/login-form");
});

// POST login

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  console.log("username :>> ", username);
  console.log("password :>> ", password);

  // Check if the username and the password are provided
  const usernameNotProvided = !username || username === "";
  const passwordNotProvided = !password || password === "";

  if (usernameNotProvided || passwordNotProvided) {
    res.render("auth/login-form", {
      errorMessage: "Provide username and password.",
    });

    return;
  }

  // Check if it is a user

  let user;
  // Check if the user exists
  User.findOne({ username: username })
    .then((foundUser) => {
      user = foundUser;

      if (!foundUser) {
        throw new Error("Incorrect username or password");
      }

      // Compare the passwords
      return bcrypt.compare(password, foundUser.password);
    })
    .then((isCorrectPassword) => {
      if (!isCorrectPassword) {
        throw new Error("Incorrect username or password");
      } else if (isCorrectPassword) {
        // Create the session + cookie and redirect the user
        // This line triggers the creation of the session in the DB,
        // and setting of the cookie with session id that will be sent with the response
        req.session.user = user;

        res.redirect("/");
      }
    })
    .catch((err) => {
      res.render("auth/login-form", {
        errorMessage: "This message shouldn't be here!.",
      });
    });
});

// POST / Logout
router.get("/logout", isLoggedIn, (req, res) => {
  // with the middleware, this uses callbacks, not promises
  req.session.destroy((err) => {
    if (err) {
      return res.render("error");
    }

    res.redirect("/");
  });
});

module.exports = router;
