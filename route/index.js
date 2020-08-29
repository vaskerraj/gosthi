var express = require('express');
var router = express.Router();
var { check, validationResult } = require('express-validator');
var passport = require('passport');

const { APP_URL } = require('../config/index');

var connection = require('../db');

router.get('/',  (req, res, next)=>{
    const refereUrlTitle = req.originalUrl.split('=')[0];
    const refereUrlSeond = req.originalUrl.split('=')[1];
    // console.log(refereUrlTitle);
    if(refereUrlTitle === "/?rel"){
        var relOrError = "rel";
        var meetingJoinId = refereUrlSeond.split('/')[1];
    }else if(refereUrlTitle === "/?error"){
        var relOrError = "error";
        var meetingJoinId = undefined;
    }else if(refereUrlTitle === "/?re"){
        var relOrError = "check";
        var meetingJoinId = refereUrlSeond.split('/')[1];
    }else if(refereUrlTitle === "/?rep"){
        var relOrError = "checkPwd";
        var meetingJoinId = refereUrlSeond.split('/')[1];
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
            connection.query("SELECT meeting.title, meeting.meeting_id, meeting.type, meeting.meeting_status, admin_user.first_name, admin_user.last_name FROM meeting INNER JOIN admin_user ON meeting.admin_id = admin_user.id WHERE meeting.admin_id = ? AND meeting.type != ?",[ adminIdAfterLoginAsUser, 'instant'], (err, relResultOnLoginIn)=>{
                if(err) throw err;
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
            connection.query("SELECT REPLACE(meeting.title, ' ', '') AS title, meeting.meeting_status, admin_user.first_name, admin_user.last_name FROM meeting INNER JOIN admin_user ON meeting.admin_id = admin_user.id WHERE meeting_id = ?", [meetingJoinId], (err, relResultLoginIn)=>{
                if(relResultLoginIn.length){
                    if(relResultLoginIn[0].meeting_status === 'running'){
                        var redirectUrlOnRunning = APP_URL+'/'+relResultLoginIn[0].title+'#userInfo.displayName="'+relResultLoginIn[0].first_name+' '+relResultLoginIn[0].last_name+'"'
                        return res.redirect(redirectUrlOnRunning);
                    }else{
                        res.render('preMeeting', {
                            title: "Check join meeting | Gosthi",
                            page : 'preMeeting',
                            meetingId : meetingJoinId
                        });
                    }
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
    if(refereUrlTitle === "/signin?rel"){
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
            res.render('auth/login', {
                title: "Sign In | Gosthi",
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
            connection.query("SELECT meeting.title, meeting.meeting_id, meeting.type, meeting.meeting_status, admin_user.first_name, admin_user.last_name FROM meeting INNER JOIN admin_user ON meeting.admin_id = admin_user.id WHERE meeting.admin_id = ? AND meeting.type != ?",[ adminIdAfterLoginAsUser, 'instant'], (err, relResultOnLoginIn)=>{
                if(err) throw err;
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
            connection.query("SELECT REPLACE(meeting.title, ' ', '') AS title, meeting.meeting_status, admin_user.first_name, admin_user.last_name FROM meeting INNER JOIN admin_user ON meeting.admin_id = admin_user.id WHERE meeting_id = ?", [meetingJoinId], (err, relResultLoginIn)=>{
                if(relResultLoginIn.length){
                    if(relResultLoginIn[0].meeting_status === 'running'){
                        var redirectUrlOnRunning = APP_URL+'/'+relResultLoginIn[0].title+'#userInfo.displayName="'+relResultLoginIn[0].first_name+' '+relResultLoginIn[0].last_name+'"'
                        return res.redirect(redirectUrlOnRunning);
                    }else{
                        res.render('preMeeting', {
                            title: "Check join meeting | Gosthi",
                            page : 'preMeeting',
                            meetingId : meetingJoinId
                        });
                    }
                }else{
                    req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                    res.redirect('/joinMeeting');
                }
            });
        }
    }
});

router.post('/login',
    passport.authenticate('local', { failureRedirect : '/signin', failureFlash: '<span class="fas fa-exclamation-circle marL10 marR4"></span> Invalid username or password'}),
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
                
                let relIdAtLogin = req.user.user_id; // user_id not relId
                connection.query("SELECT REPLACE(meeting.title, ' ', '') AS title, meeting.meeting_status, users.first_name, users.last_name FROM meeting INNER JOIN users ON meeting.admin_id = users.admin_id WHERE meeting.meeting_id = ? AND users.id = ?", [req.body.joinRel, relIdAtLogin], (err, relResult)=>{
                    if(relResult.length){
                        if(relResult[0].meeting_status === 'running'){
                        var redirectUrlOnRunning = APP_URL+'/'+relResult[0].title+'#userInfo.displayName="'+relResult[0].first_name+' '+relResult[0].last_name+'"'
                        return res.redirect(redirectUrlOnRunning);
                        }else{
                            res.render('preMeeting', {
                                title: "Check join meeting | Gosthi",
                                page : 'preMeeting',
                                meetingId : req.body.joinRel
                            });
                        }
                    }else{
                        // req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                        res.redirect('/?error=meeting');
                    }
                });
            }else{
                res.redirect('/signin');
            }
        }
});

// user meeting join at front page
router.post('/checkMeetingOnJoin', async(req, res)=>{

    var relId = req.user.relId;

    connection.query("SELECT REPLACE(meeting.title, ' ', '') AS title, meeting.meeting_status, users.first_name, users.last_name FROM meeting INNER JOIN users ON meeting.admin_id = users.admin_id WHERE meeting.meeting_id = ? AND users.id = ?", [req.body.join_meetingId, relId], (err, relResultOnJoin)=>{
        if(relResultOnJoin.length){
            if(relResultOnJoin[0].meeting_status === 'running'){
            var redirectUrlOnRunning = APP_URL+'/'+relResultOnJoin[0].title+'#userInfo.displayName="'+relResultOnJoin[0].first_name+' '+relResultOnJoin[0].last_name+'"'
            return res.redirect(redirectUrlOnRunning);
            }else{
                res.render('preMeeting', {
                    title: "Check join meeting | Gosthi",
                    page : 'preMeeting',
                    meetingId : req.body.join_meetingId
                });
            }
        }else{
            req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
            res.redirect('/?error=meeting');
        }
    });
});

router.get('/join/:id', async (req, res, next)=>{
    // console.log(req.headers.referer);
    const joinMeetingReferer = req.headers.referer;
    if(req.user !==  undefined){
        
        let relIdAtjoinId = req.user.relId;
        if(req.user.role === 'admin'){
            connection.query("UPDATE meeting SET meeting_status = ?, start_at = ? WHERE meeting_id= ?", ['running', new Date(), req.params.id], (err)=>{
                if(err) throw err;
                
            });
            connection.query("SELECT REPLACE(meeting.title, ' ', '') AS title, admin_user.first_name, admin_user.last_name FROM meeting INNER JOIN admin_user ON meeting.admin_id = admin_user.id WHERE meeting.meeting_id = ? AND admin_user.id = ?",[req.params.id,relIdAtjoinId], (err, relResultOnJoinAsAdmin)=>{
                // console.log(relResultOnJoinAsAdmin);
                if(err) throw err;
                if(!relResultOnJoinAsAdmin.length){
                    req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.")
                    res.redirect(joinMeetingReferer);
                }else{
                    var redirectUrl = APP_URL+'/'+relResultOnJoinAsAdmin[0].title+'#userInfo.displayName="'+relResultOnJoinAsAdmin[0].first_name+' '+relResultOnJoinAsAdmin[0].last_name+'"';
                    return res.redirect(redirectUrl);
                }
            });
        }else{
            // if role is user
            connection.query("SELECT REPLACE(meeting.title, ' ', '') AS title, meeting.meeting_status, users.first_name, users.last_name FROM meeting INNER JOIN users ON meeting.admin_id = users.admin_id WHERE meeting_id = ? AND users.id = ?", [req.params.id,relIdAtjoinId], (err, relResultOnJoin)=>{
                if(err) throw err;
                if(relResultOnJoin.length){
                    if(relResultOnJoin[0].meeting_status === 'running'){
                        var redirectUrlOnRunning = APP_URL+'/'+relResultOnJoin[0].title+'#userInfo.displayName="'+relResultOnJoin[0].first_name+' '+relResultOnJoin[0].last_name+'"'
                        return res.redirect(redirectUrlOnRunning);
                    }else{
                        res.render('preMeeting', {
                            title: "Check join meeting | Gosthi",
                            page : 'preMeeting',
                            meetingId : req.params.id
                        });
                    }
                }else{
                    if(joinMeetingReferer === undefined){
                        req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                        res.redirect('/joinMeeting');
                    }else{
                        req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.")
                        res.redirect(joinMeetingReferer);
                    }
                }
            });
        }
    }else{
        return res.redirect('/signin?rel=join/'+req.params.id);
    }
});

router.get('/global/:id', async (req, res, next)=>{
    // console.log(req.headers.referer);
    const instantMeetingReferer = req.headers.referer;
    if(req.user !==  undefined){

        let relIdAtGlobalId = req.user.relId;
        if(req.user.role === 'admin'){
            connection.query("UPDATE meeting SET meeting_status = ?, start_at = ? WHERE meeting_id= ?", ['running', new Date(), req.params.id], (err)=>{
                if(err) throw err;
                
            });
            connection.query("SELECT REPLACE(meeting.title, ' ', '') AS title, admin_user.first_name, admin_user.last_name FROM meeting INNER JOIN admin_user ON meeting.admin_id = admin_user.id WHERE meeting.meeting_id = ? AND admin_user.id = ?",[req.params.id, relIdAtGlobalId], (err, signInMeetingJoinResult)=>{
                if(err) throw err;
                if(!signInMeetingJoinResult.length){
                    req.flash("global_invalid", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                    res.redirect('/joinMeeting/?error=global');
                }else{
                    var redirectUrl = APP_URL+'/'+signInMeetingJoinResult[0].title+'#userInfo.displayName="'+signInMeetingJoinResult[0].first_name+' '+signInMeetingJoinResult[0].last_name+'"'
                    // res.location(redirectUrl);
                    return res.redirect(redirectUrl);
                }
            });
        }else{
            req.flash("global_invalid", "<span class='fa fa-fw fa-exclamation-circle'></span>Unauthorize meeting ID.");
            res.redirect('/joinMeeting/?error=global');
        }
    }else{
        connection.query("SELECT title, meeting_password FROM meeting WHERE meeting_id =?", [req.params.id], (err, relResultOnInstant)=>{
            if(err) throw err;
            if(relResultOnInstant.length){
                // update on join meeting
            
                if(relResultOnInstant[0].meeting_password === null){
                    res.redirect('/join/?re=global/'+req.params.id);
                }else{
                    res.redirect('/join/?rep=global/'+req.params.id);
                }
            }else{
                if(instantMeetingReferer === undefined){
                    req.flash("global_invalid", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                    res.redirect('/join/?error=global');
                }else{
                    req.flash("global_invalid", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                    res.redirect(instantMeetingReferer+'?error=global');
                }
            }
        });
    }
});

// check global
router.post('/checkMeeting', async(req, res)=>{
    var meetingType = req.body.meetingType,
        meetingId = req.body.meetingId,
        meeterName = req.body.globalName,
        meetingPassword = req.body.globalPassword;
        

    connection.query("SELECT id, meeting_password FROM meeting WHERE meeting_id = ?", [meetingId], (err, checkGlobalResult)=>{
        if(err) throw err;
        
        // prevent url edit and hack
        if(!checkGlobalResult.length){
            req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
            res.redirect('/?error=global');
        }else{
            if(meetingType === 'global'){
                if(checkGlobalResult[0].meeting_password !== null){
                    connection.query("SELECT *, REPLACE(meeting.title, ' ', '') AS title, DATE_FORMAT(meeting.meeting_date, '%a, %d %M %Y') as meeting_date FROM meeting WHERE meeting_id =? AND meeting_password = ?", [meetingId, meetingPassword], (err, checkGlobalPwdResult)=>{
                        if(err) throw err;
                        if(checkGlobalPwdResult.length){
                            if(checkGlobalPwdResult[0].meeting_status === "running"){
                                var redirectUrlOnRunning = APP_URL+'/'+checkGlobalPwdResult[0].title+'#userInfo.displayName="'+meeterName+'"';
                                return res.redirect(redirectUrlOnRunning);
                            }else{
                                res.render('meetingStatus',{
                                    title: "Wait for meeting | Gosthi",
                                    page : 'waitMeeting',
                                    currentUser : req.user || "notLogin",
                                    data : checkGlobalPwdResult[0],
                                    meeter : meeterName
                                });
                            }
                        }else{
                            req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting password.");
                            return res.redirect('/join/?rep=global/'+meetingId);
                        }
                    });
                }else{
                    connection.query("SELECT *, REPLACE(meeting.title, ' ', '') AS title, DATE_FORMAT(meeting.meeting_date, '%a, %d %M %Y') as meeting_date FROM meeting WHERE meeting_id =?", [meetingId], (err, checkGlobalNoPwdResult)=>{
                        if(err) throw err;
                        if(checkGlobalNoPwdResult[0].meeting_status === "running"){
                            var redirectUrlOnRunning = APP_URL+'/'+checkGlobalNoPwdResult[0].title+'#userInfo.displayName="'+meeterName+'"';
                            return res.redirect(redirectUrlOnRunning);
                        }else{
                            res.render('meetingStatus',{
                                title: "Wait for meeting | Gosthi",
                                page : 'waitMeeting',
                                currentUser : req.user || "notLogin",
                                data : checkGlobalNoPwdResult[0],
                                meeter : meeterName
                            });
                        }
                    });
                }
            }else{
                
                let relIdAtCheckMeeting = req.user.relId;

                connection.query("SELECT REPLACE(meeting.title, ' ', '') as title, meeting.meeting_id, meeting.type, DATE_FORMAT(meeting.meeting_date, '%a, %d %M %Y') as meeting_date, meeting.meeting_time, meeting.meeting_duration, meeting.meeting_status, users.first_name, users.last_name FROM meeting INNER JOIN users ON meeting.admin_id = users.admin_id WHERE meeting.meeting_id = ? AND users.id = ?", [meetingId, relIdAtCheckMeeting], (err, checkJoinResult)=>{
                    if(err) throw err;
                    if(checkJoinResult[0].meeting_status === "running"){
                        var redirectUrlOnRunning = APP_URL+'/'+checkJoinResult[0].title+'#userInfo.displayName="'+checkJoinResult[0].first_name+' '+checkJoinResult[0].last_name+'"';
                        return res.redirect(redirectUrlOnRunning);
                    }else{
                        res.render('meetingStatus',{
                            title: "Wait for meeting | Gosthi",
                            page : 'waitMeeting',
                            currentUser : req.user || "notLogin",
                            data : checkJoinResult[0],
                            meeter : checkJoinResult[0].first_name + ' '+ checkJoinResult[0].last_name
                        });
                    }
                });
            }
        }
    });
});

// check meeting status using ajax
router.post('/meetingStatus', (req, res)=>{
    
    const meetingStatus_meetingId = req.body.id;
    connection.query("SELECT id FROM meeting WHERE meeting_id = ? AND meeting_status = ?", [meetingStatus_meetingId, 'running'],(err, checkMeetingStatuResult)=>{
        if(err) throw err;
        if(checkMeetingStatuResult.length){
            res.status(200).json({
                status: true
            });
        }else{
            res.status(200).json({
                status: false
            });
        }
    });
});


// join meeting
router.get('/join', (req, res, next)=>{
    const refereGlobalTitle = req.originalUrl.split('=')[0];
    const refereGlobalSecond = req.originalUrl.split('=')[1];

    if(refereGlobalTitle === "/join/?re"){
        var relOrError = "check";
        var meetingJoinId = refereGlobalSecond.split('/')[1];
    }else if(refereGlobalTitle === "/join/?rep"){
        var relOrError = "checkPwd";
        var meetingJoinId = refereGlobalSecond.split('/')[1];
    }else{
        var relOrError = "";
        var meetingJoinId = undefined;
    }
    if(meetingJoinId === undefined){
        res.render('joinMeeting',{
            title: "Join Meeting | Gosthi",
            page : 'joinmeeting',
            loginPage : false,
            currentUser : req.user || "notLogin",
            relOrError : relOrError,
            rel : 'undefined'
        })
    }else{
        connection.query("SELECT id FROM meeting WHERE meeting_id = ?", [meetingJoinId], (err, relResultJoinMeeting)=>{
            if(relResultJoinMeeting.length){
                
                res.render('joinMeeting',{
                    title: "Join Meeting | Gosthi",
                    page : 'joinmeeting',
                    loginPage : false,
                    currentUser : req.user || "notLogin",
                    relOrError : relOrError,
                    rel : meetingJoinId
                });

            }else{
                req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                res.redirect('/join');
            }
        });
        
    }
});

router.post('/join', (req, res, next)=>{
    const joinMeeting_id = req.body.meetingId;
    const joinMeeting_meetingId = joinMeeting_id.replace(/\s/g,"");
    connection.query("SELECT id FROM meeting WHERE meeting_id = ?", [joinMeeting_meetingId], (err, joinMeetingResult)=>{
        if(joinMeetingResult.length){
            
            res.redirect('/global/'+joinMeeting_meetingId);
            return;
            
        }else{
            req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
            res.redirect('/join');
        }
    });
});

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;