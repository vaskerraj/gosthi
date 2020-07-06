var express = require('express');
var router = express.Router();
var {check, validationResult} = require('express-validator');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');

var connection = require('../db');

const { npkdata, tempHumData, totalDevices } = require('../models/dashboard');
// const { deviceList, deviceDetails, deviceReport } = require('../models/deviceList');

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/SA/login');
}

router.get('/', ensureAuthenticated, (req, res, next)=>{
    console.log(req.user);
    res.render('SA/index', {
        title: "Index || SA || Gosthi",
        page : 'index',
        loginPage : false,
        currentUser : req.user || "notLogin"
    });   
});

router.post('/login',
    passport.authenticate('superLocal', { failureRedirect : '/SA/', failureFlash: '<span class="fas fa-exclamation-circle marL10 marR4"></span> Invalid username or password'}),
    (req, res, next)=>{
        console.log("Login Successfully");
        // console.log(req.user);
        res.redirect('/SA/index');
});

passport.serializeUser((user, done)=>{
    return done(null, user.id);
});

passport.deserializeUser((id, done)=>{
    // User.getUserById(id, (err, user)=>{
    //     return done(err, user);
    // });

    connection.query("SELECT login.id, login.username, admin_user.first_name, admin_user.last_name, admin_user.email, admin_user.role FROM admin_user INNER JOIN login ON admin_user.id = login.admin_id WHERE login.id = ?, AND login.role = ?", [id, 'superadmin'], (err, rows)=>{
        if(err) throw err;
        return done(err, rows[0]);
    });
});

passport.use('superLocal',new localStrategy( (username, password, done)=>{
    connection.query("select * from login where username = ? AND role = ?", [username, 'superadmin'], (err, rows)=>{
        if(err) return done(err);
        if(!rows.length){
            return done (null, false , { messages: "Username not found"});
        }
        bcrypt.compare(password, rows[0].password, (err, isMatch)=>{
            if(isMatch){
                return done(null, rows[0]);
              }else{
                return done(null, false, {messages : "Invalid password"});
              }
        });
    });
}));


router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

router.get('/devices', ensureAuthenticated, async (req, res, next)=>{
    let devicePromise = [
        deviceList(req.user.id)
    ];

    Promise.all(devicePromise)
        .then((devicesResult) =>{
            res.render('deviceList', {
                title : "Device List || IoT Dashboard",
                page : deviceList,
                currentUser : req.user,
                loginPage : false,
                page : 'devices',
                data : {
                    list : devicesResult[0]
                }
                
            });
    }).catch((err)=>{
        console.log("device list reject");
    });
});

router.get('/report/:id/:rel', ensureAuthenticated, async (req, res, next)=>{
    // console.log(req.params.id);
    let reportPromise = [
        deviceDetails(req.user.id, req.params.id),
        deviceReport(req.user.id, req.params.id, req.params.rel)
    ];
    Promise.all(reportPromise).
        then((deviceReport) => {
            res.render('report', {
                title : "Report of "+deviceReport[0].name+" || IoT Dashboard",
                loginPage: false,
                currentUser : req.user,
                page : 'devices',
                data : {
                    device : deviceReport[0],
                    report : deviceReport[1]
                }
            });
        }).catch((err)=>{
            console.log("report Promise reject");
        });
});

router.post('/category', ensureAuthenticated,
    check("category","Prrovide category").not().isEmpty(),
(req,res, next) =>{ 
    var category = req.body.category;

    var categoryError = validationResult(req);

    if(!categoryError.isEmpty()){

        res.render('category',{
            errors : categoryError['errors'],
            title : 'Category',
            categoryActiveClass : true,
            loginPage : false,
            page : 'protfolio',
            currentUser : req.user
        });

    }else{

        connection.query("INSERT INTO category SET category = ?, created_at=?  ORDER BY id DESC", [category, new Date()], (err, results, fields)=>{
            if(err) throw err;
        });
        req.flash("success", "New category sucessfully added !!!");

        res.location('/category');
        res.redirect('/category');
    }
});

module.exports = router;