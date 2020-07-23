var express = require('express');
var router = express.Router();
var { check, validationResult } = require('express-validator');
var passport = require('passport');

var connection = require('../db');

router.get('/',  (req, res, next)=>{
    const refereUrlTitle = req.originalUrl.split('=')[0];
    const refereUrlSeond = req.originalUrl.split('=')[1];
    console.log(refereUrlTitle);
    if(refereUrlTitle === "/?rel"){
        var relOrError = "rel";
        var meetingJoinId = refereUrlSeond.split('/')[1];
    }else if(refereUrlTitle === "/?error"){
        var relOrError = "error";
        var meetingJoinId = undefined;
    }else{
        var relOrError = "";
        var meetingJoinId = undefined;
    }

    // if not logged in
    if(req.user === undefined){
        // if have meeting join refere
        if(meetingJoinId === undefined){
            res.render('index', {
                title: "Index | Gosthi",
                page : 'index',
                loginPage : false,
                currentUser : req.user || "notLogin",
                relOrError : relOrError,
                rel : 'undefined'
            });
        }else{
            res.render('index', {
                title: "Index | Gosthi",
                page : 'index',
                loginPage : false,
                currentUser : req.user || "notLogin",
                relOrError : relOrError,
                rel: meetingJoinId
            });
        }
    }else{
        if(meetingJoinId === undefined){
            const adminIdAfterLoginAsUser = req.user.admin_id;
            connection.query("SELECT * FROM meeting WHERE admin_id = ?",[ adminIdAfterLoginAsUser ], (err, relResultOnLoginIn)=>{
                res.render('index', {
                    title: "Index | Gosthi",
                    page : 'index',
                    loginPage : false,
                    currentUser : req.user || "notLogin",
                    relOrError : relOrError,
                    rel: meetingJoinId,
                    relData : relResultOnLoginIn
                });
            });
        }else{
            connection.query("SELECT * FROM meeting WHERE meeting_id = ?", [meetingJoinId], (err, relResultOnLoginIn)=>{
                if(relResultOnLoginIn.length){
                    res.redirect('https://15.206.115.114/'+relResultOnLoginIn[0].title);
                }else{
                    req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                    res.redirect('/');
                }
            });
        }
    }
});

router.get('/signin',  (req, res, next)=>{
    const refereUrlTitle = req.originalUrl.split('=')[0];
    const refereUrlSeond = req.originalUrl.split('=')[1];
    if(refereUrlTitle === "/?rel"){
        var relOrError = "rel";
        var meetingJoinId = refereUrlSeond.split('/')[1];
    }else if(refereUrlTitle === "/?error"){
        var relOrError = "error";
        var meetingJoinId = undefined;
    }else{
        var relOrError = "";
        var meetingJoinId = undefined;
    }

    // if not logged in
    if(req.user === undefined){
        // if have meeting join refere
        if(meetingJoinId === undefined){
            res.render('auth/login', {
                title: "Sign In | Gosthi",
                page : 'signin',
                loginPage : false,
                currentUser : req.user || "notLogin",
                relOrError : relOrError,
                rel : 'undefined'
            });
        }else{
            res.render('index', {
                title: "Index | Gosthi",
                page : 'index',
                loginPage : false,
                currentUser : req.user || "notLogin",
                relOrError : relOrError,
                rel: meetingJoinId
            });
        }
    }else{
        if(meetingJoinId === undefined){
            const adminIdAfterLoginAsUser = req.user.admin_id;
            connection.query("SELECT * FROM meeting WHERE admin_id = ?",[ adminIdAfterLoginAsUser ], (err, relResultOnLoginIn)=>{
                res.render('signin', {
                    title: "Index | Gosthi",
                    page : 'index',
                    loginPage : false,
                    currentUser : req.user || "notLogin",
                    relOrError : relOrError,
                    rel: meetingJoinId,
                    relData : relResultOnLoginIn
                });
            });
        }else{
            connection.query("SELECT * FROM meeting WHERE meeting_id = ?", [meetingJoinId], (err, relResultOnLoginIn)=>{
                if(relResultOnLoginIn.length){
                    res.redirect('https://15.206.115.114/'+relResultOnLoginIn[0].title);
                }else{
                    req.flash("rel_error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                    res.redirect('/');
                }
            });
        }
    }
});

router.post('/login',
    passport.authenticate('local', { failureRedirect : '/', failureFlash: '<span class="fas fa-exclamation-circle marL10 marR4"></span> Invalid username or password'}),
    (req, res, next)=>{
        req.flash = "Successfull Login";
        if(req.user.role === 'superadmin'){
            res.redirect('/SA/');
        }else if(req.user.role === 'admin'){
            res.redirect('/admin/');
        }else{
            // if user
            // if having meeting room refere
            if(req.body.joinRel !== 'undefined'){
                connection.query("SELECT title FROM meeting WHERE meeting_id =?", [req.body.joinRel], (err, relResult)=>{
                    if(relResult.length){
                        res.redirect('https://15.206.115.114/'+relResult[0].title);
                    }else{
                        // req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                        res.redirect('/?error=meeting');
                    }
                });
            }else{
                res.redirect('/');
            }
        }
});

router.get('/join/:id', async (req, res, next)=>{
    console.log(req.headers.referer);
    const joinMeetingReferer = req.headers.referer;
    if(req.user !==  undefined){
        connection.query("SELECT title FROM meeting WHERE meeting_id =?", [req.params.id], (err, relResultOnJoin)=>{
            if(err) throw err;
            if(relResultOnJoin.length){
                res.redirect('https://15.206.115.114/'+relResultOnJoin[0].title);
            }else{
                if(joinMeetingReferer === undefined){
                    req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                    res.redirect('/');
                }else{
                    req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.")
                    res.redirect(joinMeetingReferer);
                }
            }
        });
    }else{
        return res.redirect('/?rel=join/'+req.params.id);
    }
});

router.get('/global/:id', async (req, res, next)=>{
    console.log(req.headers.referer);
    const instantMeetingReferer = req.headers.referer;
    // for pass at client (video call)
    if(req.user !==  undefined){
        
    }
    connection.query("SELECT title FROM meeting WHERE meeting_id =?", [req.params.id], (err, relResultOnInstant)=>{
        if(err) throw err;
        if(relResultOnInstant.length){
            // update on join meeting
            connection.query("UPDATE meeting SET meeting_status = ?, start_at = ? WHERE meeting_id= ?", ['running', new Date(), req.params.id], (err)=>{
                if(err) throw err;
            });

            res.redirect('https://15.206.115.114/'+relResultOnInstant[0].title);
        }else{
            if(instantMeetingReferer === undefined){
                req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                res.redirect('/');
            }else{
                req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                res.redirect(instantMeetingReferer);
            }
        }
    });
});

// join meeting

router.get('/joinMeeting', (req, res, next)=>{
    res.render('joinMeeting',{
        title: "Index | Gosthi",
        page : 'joinmeeting',
        loginPage : false,
        currentUser : req.user || "notLogin"
    })
});

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;