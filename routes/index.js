const router = require("express").Router();
const isLoggedIn = require("./../middleware/isLoggedIn");

/* GET home page */
router.get("/", (req, res, next) => {
  let userIsLoggedIn = false;
  if (req.session.user) {
    userIsLoggedIn = true;
  }
  res.render("index", { userIsLoggedIn: userIsLoggedIn });
});

// Get main
router.get("/main", isLoggedIn, (req, res, next) => {
  console.log("requesting the secret view");
  res.render("main");
});

// Get private
router.get("/private", isLoggedIn, (req, res, next) => {
  console.log("requesting the secret view");
  res.render("private");
});
module.exports = router;
