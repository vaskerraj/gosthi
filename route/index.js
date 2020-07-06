var express = require('express');
var router = express.Router();
var {check, validationResult} = require('express-validator');
var passport = require('passport');

const { ensureAuthenticated, checkRole  } = require('../config/auth');

var connection = require('../db');

const { npkdata, tempHumData, totalDevices } = require('../models/dashboard');
// const { deviceList, deviceDetails, deviceReport } = require('../models/deviceList');


router.get('/',  (req, res, next)=>{
    console.log(req.user);
    const meetingJoinId = req.originalUrl.split('join/')[1];
    // if not logged in
    if(req.user === undefined){
        // if have meeting join refere
        if(meetingJoinId === undefined){
            res.render('index', {
                title: "Index || Gosthi",
                page : 'index',
                loginPage : false,
                currentUser : req.user || "notLogin",
                rel : 'undefined'
            });
        }else{
            res.render('index', {
                title: "Index || Gosthi",
                page : 'index',
                loginPage : false,
                currentUser : req.user || "notLogin",
                rel: meetingJoinId
            });
        }
    }else{
        if(meetingJoinId === undefined){
            connection.query("SELECT * FROM meeting WHERE id = ?", [meetingJoinId], (err, relResultOnLoginIn)=>{
                console.log(relResultOnLoginIn.length);
                res.render('index', {
                    title: "Index || Gosthi",
                    page : 'index',
                    loginPage : false,
                    currentUser : req.user || "notLogin",
                    rel: meetingJoinId,
                    relData : relResultOnLoginIn[0]
                });
            });
        }else{
            connection.query("SELECT * FROM meeting WHERE id = ?", [meetingJoinId], (err, relResultOnLoginIn)=>{
                console.log(relResultOnLoginIn.length);
                if(relResultOnLoginIn.length){
                    res.redirect('https://15.206.115.114/'+relResultOnLoginIn[0].title);
                }else{
                    res.redirect('/?error=meeting');
                }
            });
        }
    }
});


router.post('/login',
    passport.authenticate('local', { failureRedirect : '/', failureFlash: '<span class="fas fa-exclamation-circle marL10 marR4"></span> Invalid username or password'}),
    (req, res, next)=>{
        console.log("Login Successfully");
        console.log(req.user);
        req.flash = "Successfull Login";
        if(req.user.role === 'superadmin'){
            res.redirect('/SA/');
        }else if(req.user.role === 'admin'){
            res.redirect('/admin/');
        }else{
            // if user
           console.log(`meeing rel: ${req.body.joinRel}`);
            // if having meeting room refere
            if(req.body.joinRel !== 'undefined'){
                connection.query("SELECT title FROM meeting WHERE id =?", [req.body.joinRel], (err, relResult)=>{
                    console.log(relResult);
                    if(relResult.length){
                        res.redirect('https://15.206.115.114/'+relResult[0].title);
                    }else{
                        res.redirect('/?error=meeting');
                    }
                });
            }else{
                res.redirect('/');
            }
        }
});

router.get('/join/:id', async (req, res, next)=>{
    // console.log(req.params.id);
    console.log(`is auth: ${ensureAuthenticated}`);
    if(req.user !==  undefined){
        connection.query("SELECT title FROM meeting WHERE id =?", [req.params.id], (err, relResultOnJoin)=>{
            if(err) throw err;
            if(relResultOnJoin.length){
                res.redirect('https://15.206.115.114/'+relResultOnJoin[0].title);
            }else{
                res.redirect('/?error=meeting');
            }
        });
    }else{
        return res.redirect('/?rel=join/'+req.params.id);
    }
});

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;