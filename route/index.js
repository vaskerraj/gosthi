var express = require('express');
var router = express.Router();
var { check, validationResult } = require('express-validator');
var passport = require('passport');

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
                        var redirectUrlOnRunning = 'https://15.206.115.114/'+relResultLoginIn[0].title+'#userInfo.displayName="'+relResultLoginIn[0].first_name+' '+relResultLoginIn[0].last_name+'"'
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
                connection.query("SELECT REPLACE(meeting.title, ' ', '') AS title, meeting.meeting_status, admin_user.first_name, admin_user.last_name FROM meeting INNER JOIN admin_user ON meeting.admin_id = admin_user.id WHERE meeting_id = ?", [req.body.joinRel], (err, relResult)=>{
                    if(relResult.length){
                        if(relResult[0].meeting_status === 'running'){
                        var redirectUrlOnRunning = 'https://15.206.115.114/'+relResult[0].title+'#userInfo.displayName="'+relResult[0].first_name+' '+relResult[0].last_name+'"'
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
                res.redirect('/');
            }
        }
});

router.post('/checkMeetingOnJoin', async(req, res)=>{
    connection.query("SELECT REPLACE(meeting.title, ' ', '') AS title, meeting.meeting_status, admin_user.first_name, admin_user.last_name FROM meeting INNER JOIN admin_user ON meeting.admin_id = admin_user.id WHERE meeting_id = ?", [req.body.join_meetingId], (err, relResultOnJoin)=>{
        if(relResultOnJoin.length){
            if(relResultOnJoin[0].meeting_status === 'running'){
            var redirectUrlOnRunning = 'https://15.206.115.114/'+relResultOnJoin[0].title+'#userInfo.displayName="'+relResultOnJoin[0].first_name+' '+relResultOnJoin[0].last_name+'"'
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
        connection.query("SELECT REPLACE(meeting.title, ' ', '') AS title, meeting.meeting_status, admin_user.first_name, admin_user.last_name FROM meeting INNER JOIN admin_user ON meeting.admin_id = admin_user.id WHERE meeting_id = ?", [req.params.id], (err, relResultOnJoin)=>{
            if(err) throw err;
            if(relResultOnJoin.length){
                if(relResultOnJoin[0].meeting_status === 'running'){
                    var redirectUrlOnRunning = 'https://15.206.115.114/'+relResultOnJoin[0].title+'#userInfo.displayName="'+relResultOnJoin[0].first_name+' '+relResultOnJoin[0].last_name+'"'
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
    // console.log(req.headers.referer);
    const instantMeetingReferer = req.headers.referer;
    if(req.user !==  undefined){
        if(req.user.role === 'admin'){
            connection.query("UPDATE meeting SET meeting_status = ?, start_at = ? WHERE meeting_id= ?", ['running', new Date(), req.params.id], (err)=>{
                if(err) throw err;
                
            });
            connection.query("SELECT REPLACE(meeting.title, ' ', '') AS title, admin_user.first_name, admin_user.last_name FROM meeting INNER JOIN admin_user ON meeting.admin_id = admin_user.id WHERE meeting_id = ?",[req.params.id], (err, signInMeetingJoinResult)=>{
                if(err) throw err;
                if(!signInMeetingJoinResult.length){
                    req.flash("global_invalid", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                    res.redirect('/?error=global');
                }else{
                    var redirectUrl = 'https://15.206.115.114/'+signInMeetingJoinResult[0].title+'#userInfo.displayName="'+signInMeetingJoinResult[0].first_name+' '+signInMeetingJoinResult[0].last_name+'"'
                    // res.location(redirectUrl);
                    return res.redirect(redirectUrl);
                }
            });
        }else{
            req.flash("global_invalid", "<span class='fa fa-fw fa-exclamation-circle'></span>Unauthorize meeting ID.");
            res.redirect('/?error=global');
        }
    }else{
        connection.query("SELECT title, meeting_password FROM meeting WHERE meeting_id =?", [req.params.id], (err, relResultOnInstant)=>{
            if(err) throw err;
            if(relResultOnInstant.length){
                // update on join meeting
                
                if(relResultOnInstant[0].meeting_password === null){
                    res.redirect('/?re=global/'+req.params.id);
                }else{
                    res.redirect('/?rep=global/'+req.params.id);
                }
            }else{
                if(instantMeetingReferer === undefined){
                    req.flash("global_invalid", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                    res.redirect('/?error=global');
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
    var meetingType = req.body.meetingTpe,
        meetingId = req.body.meetingId,
        meeterName = req.body.globalName,
        meetingPassword = req.body.globalPassword;

        connection.query("SELECT REPLACE(meeting.title, ' ', '') AS title, meeting.meeting_password, meeting.meeting_status, admin_user.first_name, admin_user.last_name FROM meeting INNER JOIN admin_user ON meeting.admin_id = admin_user.id WHERE meeting_id = ?", [meetingId], (err, checkGlobalResult)=>{
            if(err) throw err;
            // prevent url edit and hack
            if(!checkGlobalResult.length){
                req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting ID.");
                res.redirect('/?error=global');
            }else{
                if(checkGlobalResult[0].meeting_status === "running"){
                    var redirectUrlOnRunning = 'https://15.206.115.114/'+checkGlobalResult[0].title+'#userInfo.displayName="'+checkGlobalResult[0].first_name+' '+checkGlobalResult[0].last_name+'"';
                    return res.redirect(redirectUrlOnRunning);
                }else{
                    if(meetingType === 'global'){
                        if(checkGlobalResult[0].meeting_password !== null){
                            connection.query("SELECT *, REPLACE(meeting.title, ' ', '') AS title, DATE_FORMAT(meeting.meeting_date, '%a, %d %M %Y') as meeting_date FROM meeting WHERE meeting_id =? AND meeting_password =?", [meetingId, meetingPassword], (err, checkGlobalPwdResult)=>{
                                if(err) throw err;
                                if(checkGlobalPwdResult.length){
                                    res.render('meetingStatus',{
                                        title: "Wait for meeting | Gosthi",
                                        page : 'waitMeeting',
                                        currentUser : req.user || "notLogin",
                                        data : checkGlobalNoPwdResult[0],
                                        meeter : meeterName
                                    });
                                }else{
                                    req.flash("error", "<span class='fa fa-fw fa-exclamation-circle'></span>Invalid meeting password.");
                                    return res.redirect('/?re=global/'+meetingId);
                                }
                            });
                        }else{
                            connection.query("SELECT *, REPLACE(meeting.title, ' ', '') AS title, DATE_FORMAT(meeting.meeting_date, '%a, %d %M %Y') as meeting_date FROM meeting WHERE meeting_id =?", [meetingId], (err, checkGlobalNoPwdResult)=>{
                                if(err) throw err;
                                res.render('meetingStatus',{
                                    title: "Wait for meeting | Gosthi",
                                    page : 'waitMeeting',
                                    currentUser : req.user || "notLogin",
                                    data : checkGlobalNoPwdResult[0],
                                    meeter : meeterName
                                });
                            });
                        }
                    }else{
                        connection.query("SELECT REPLACE(meeting.title, ' ', '') as title, meeting.meeting_id, meeting.type, DATE_FORMAT(meeting.meeting_date, '%a, %d %M %Y') as meeting_date, meeting.meeting_time, meeting.meeting_duration, meeting.meeting_status, admin_user.first_name, admin_user.last_name FROM meeting INNER JOIN admin_user ON meeting.admin_id = admin_user.id WHERE meeting_id = ?", [meetingId], (err, checkJoinResult)=>{
                            if(err) throw err;
                            res.render('meetingStatus',{
                                title: "Wait for meeting | Gosthi",
                                page : 'waitMeeting',
                                currentUser : req.user || "notLogin",
                                data : checkJoinResult[0],
                                meeter : checkJoinResult[0].first_name + ' '+ checkJoinResult[0].last_name
                            });
                        });
                    }
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