var express = require('express');
var router = express.Router();

// Bring in the User Registration function
const {
  userAuth,
  userLogin,
  checkRole,
  serializeUser
} = require("../utils/Auth");

router.get('/user', (req, res, next)=>{
  res.render('auth/testlogin', {
      title : "Login | Jhosti",
      loginPage : true,
      currentUser : req.user
  });
});
router.get('/admin', (req, res, next)=>{
  res.render('auth/testlogin', {
      title : "Login | Jhosti",
      loginPage : true,
      currentUser : ""
  });
});

router.get('/sadmin', (req, res, next)=>{
  res.render('auth/testlogin', {
      title : "Login | Jhosti",
      loginPage : true,
      currentUser : ""
  });
});


// Users Login Route
router.post("/user", async (req, res) => {
    await userLogin(req.body, "user", res);
});
  
// Admin Login Route
router.post("/admin", async (req, res) => {
  await userLogin(req.body, "admin", res);
});

// Super Admin Login Route
router.post("/sadmin", async (req, res) => {
  await userLogin(req.body, "superadmin", res);
});


// Profile Route
router.get("/profile", async (req, res) => {
  return res.json(serializeUser(req.user));
});

// Users Protected Route
router.get(
    "/user-p",
    userAuth,
    checkRole(["user"]),
    async (req, res) => {
        return res.json("Hello User");
    }
);

// Admin Protected Route
router.get(
"/admin-p",
userAuth,
checkRole(["admin"]),
async (req, res) => {
    return res.json("Hello Admin");
}
);
  
  // Super Admin Protected Route
router.get(
    "/super-admin-protectd",
    userAuth,
    checkRole(["superadmin"]),
    async (req, res) => {
      return res.json("Hello Super Admin");
    }
);

module.exports = router;