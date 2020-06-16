var express = require('express');
var router = express.Router();
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');

var connection = require('../db');

router.get('/', (req, res, next)=>{
    res.render('auth/login', {
        title : "Login | Jhosti",
        loginPage : true,
    });
});

module.exports = router;