var express = require('express');
var router = express.Router();
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');

var connection = require('../db');

router.get('/', (req, res, next)=>{
    res.render('auth/login', {
        title : " Login || SA || Jhosti",
        loginPage : true,
        currentUser : req.user
    });
});
  

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/login');
});

module.exports = router;