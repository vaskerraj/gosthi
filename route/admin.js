var express = require('express');
var router = express.Router();
var bycrypt = require('bcryptjs');
var {check, validationResult} = require('express-validator');
const nodemailer = require('nodemailer');

const { ensureAuthenticated, checkRole } = require('../config/auth');

var connection = require('../db');

const  { meetingId }  = require('../models/meetingId');
const { totalUsers, totalActiveUsers } = require('../models/dashboard');
const { meetingRooms, upcomingMeetingRooms, inviteUsersList } = require('../models/meeting');
const { usersList } = require('../models/users');

// email
const { emailHandler } = require('../email/email');


router.get('/', ensureAuthenticated, checkRole(['admin']), async (req, res, next)=>{
    let meetingRoomPromise = [
        meetingRooms(req.user.relId),
        upcomingMeetingRooms(req.user.relId),
        inviteUsersList(req.user.relId)
    ];
    Promise.all(meetingRoomPromise)
        .then((meeting)=>{
            res.render('admin/', {
                title : "Index || Ghosti Hub",
                page : "index",
                currentUser : req.user,
                loginPage : false,
                data : {
                    rooms : meeting[0],
                    upcoming : meeting[1],
                    users : meeting[2]
                }
            });
        }).catch((err)=>{
            if(err) throw err;
        });
});


// meeting room route
router.post('/', ensureAuthenticated, checkRole(['admin']),
    check("meetingTitle", "Provide metting title").not().isEmpty(),
    check("meetingType", "Provide meeting type").not().isEmpty(),
(req, res, next)=>{

    var meetingTitle = req.body.meetingTitle,
        meetingType = req.body.meetingType,
        meetingDate = req.body.meetingDate,
        meetingTime = req.body.meetingTime,
        meetingDuration = req.body.meetingDuration;

    var errors = validationResult(req);
    
    if(!errors.isEmpty()){
        let meetingRoomPromise = [
            meetingRooms(req.user.relId)
        ];
        Promise.all(meetingRoomPromise)
            .then((meeting)=>{
                res.render('admin/', {
                    errors : errors['errors'],
                    title : "Index || Ghosti Hub",
                    page : "index",
                    currentUser : req.user,
                    loginPage : false,
                    data : {
                        rooms : meeting[0]
                    }
                });
            }).catch((err)=>{
                if(err) throw err;
            });
    }else{
        if(meetingType === "normal"){
            var meetingSql = "INSERT INTO meeting SET admin_id = ?, title = ?, type = ?, created_at = ?";
            var meetingSqlData = [req.user.relId, meetingTitle, meetingType, new Date()];
        }else{
            var meetingSql = "INSERT INTO meeting SET admin_id = ?, title = ?, type = ?, meeting_date =?, meeting_time = ?, meeting_duration = ?, created_at = ?";
            var meetingSqlData = [req.user.relId, meetingTitle, meetingType, meetingDate, meetingTime, meetingDuration, new Date()];
        }
        connection.query(meetingSql, meetingSqlData, (err, results, fields)=>{
            if(err) throw err;
        });
        
        // req.toastr.success("Successfully added new protfolio");
        req.flash("success","<span class='fa fa-fw fa-check'></span> Successfully created new meeting");

        res.location('/admin/');
        res.redirect('/admin/');
    }

});


router.post('/instantMeeting', ensureAuthenticated, checkRole(['admin']), (req, res, next)=>{
    const instantMeet_adminId = req.body.id;
    meetingId().then((meetingId)=>{
        connection.query("INSERT INTO meeting SET admin_id = ?, meeting_id = ?, title = ?, type = ?, created_at = ?", [instantMeet_adminId, meetingId, 'Instant Meet', 'instant', new Date()], (err, instatMeetResult)=>{
            if(err) throw err;
            res.status(200).json({
                id: instatMeetResult.insertId,
                callbackId : instantMeet_adminId,
                meetingId : meetingId,
            })
        });
    });
});

router.post('/meetingDetails', ensureAuthenticated, checkRole(['admin']), async (req, res, next)=>{
    var meetingId = req.body.id;
    connection.query("SELECT * FROM meeting WHERE id = ?", [meetingId], (err, meetingDetails)=>{
        if(err) throw err;
        return res.status(200).json(meetingDetails[0]);
    });
});

// Invite users

router.post('/inviteUsers', ensureAuthenticated, checkRole(['admin']),
    check("invitedEmails", "Provide email address").not().isEmpty(),
    check("selectedMeetingId", "").not().isEmpty(),
    check("selectedMeetingTitle", "").not().isEmpty(),
    check("selectedMeetingLink", "").not().isEmpty(),
(req,res,next)=>{
    const invitedEmails = req.body.invitedEmails,
        selectedMeetingId = req.body.selectedMeetingId,
        selectedMeetingTitle = req.body.selectedMeetingTitle,
        selectedMeetingDate = req.body.selectedMeetingDate,
        selectedMeetingLink = req.body.selectedMeetingLink;
    emailHandler(invitedEmails, selectedMeetingId, selectedMeetingTitle, selectedMeetingDate, selectedMeetingLink);
    
    res.location('/admin/');
    res.redirect('/admin/');
});

router.get('/editMeeting/:id', ensureAuthenticated, checkRole(['admin']), async (req, res, next)=>{
    const editMeetingId = req.params.id;
    
    connection.query("SELECT id, title, type, meeting_date, meeting_time, meeting_duration FROM meeting WHERE id = ?", [editMeetingId], (err, editMettingResult)=>{
        res.status(200).json( editMettingResult[0] );
    });
});

router.post('/editMeeting', ensureAuthenticated, checkRole(['admin']),
    check("edit_meetingTitle", "Provide metting title").not().isEmpty(),
(req, res, next)=>{
    const edit_meetingId =  req.body.meetingId,
        edit_meetingTitle = req.body.edit_meetingTitle,
        edit_meetingType = req.body.edit_meetingType,
        edit_meetingDate = req.body.edit_meetingDate,
        edit_meetingTime = req.body.edit_meetingTime,
        edit_meetingDuration = req.body.edit_meetingDuration;

    const error_updateMeeting = validationResult(req);
    
    if(!error_updateMeeting.isEmpty()){
        let meetingRoomPromise = [
            meetingRooms(req.user.relId)
        ];
        Promise.all(meetingRoomPromise)
            .then((meeting)=>{
                res.render('admin/', {
                    errors : error_updateMeeting['errors'],
                    title : "Index || Ghosti Hub",
                    page : "index",
                    currentUser : req.user,
                    loginPage : false,
                    data : {
                        rooms : meeting[0]
                    }
                });
            }).catch((err)=>{
                if(err) throw err;
            });
    }else{

        if(edit_meetingType === "normal"){
            var editMeetingSql = "UPDATE meeting SET title = ? WHERE id = ?";
            var editMeetingSqlData = [edit_meetingTitle, edit_meetingId];
        }else{
            
            var editMeetingSql = "UPDATE meeting SET title = ?, meeting_date = ?, meeting_time = ?, meeting_duration =? WHERE id = ?";
            var editMeetingSqlData = [edit_meetingTitle, edit_meetingDate, edit_meetingTime, edit_meetingDuration, edit_meetingId];
        }

        connection.query(editMeetingSql, editMeetingSqlData, (err)=>{
            if(err) throw err;
        });

        req.flash("success","<span class='fa fa-fw fa-check'></span> Successfully edited meeting.");

        res.location('/admin/');
        res.redirect('/admin/');
    }
});


router.post('/upcomingMeeting', ensureAuthenticated, checkRole(['admin']), (req, res, next)=>{
    const upcomingMeeting_adminId = req.body.id;
    connection.query("SELECT * FROM meeting WHERE admin_id =? AND type = ?", [upcomingMeeting_adminId, 'schedule'], (err, upcomingMeetingResult)=>{
        if(err) throw err;
        return res.status(200).json(upcomingMeetingResult);
    });
});

router.get("/deleteMeeting/:id", ensureAuthenticated, checkRole(['admin']), (req, res, next)=>{
    const deleteMeetingId = req.params.id;
    connection.query("DELETE FROM meeting WHERE id = ?", [deleteMeetingId], (err)=>{
        if(err) throw err;
        req.flash("meeting_del_success","<span class='fa fa-fw fa-check'></span> Successfully deleted meeting.");
        res.send("done");
    });
});

// users route

router.get('/users', ensureAuthenticated, checkRole(['admin']), async (req, res, next)=>{
    let userPromise = [
        usersList(req.user.relId)
    ];

    Promise.all(userPromise)
        .then((userList)=>{
            res.render('admin/users', {
                title : "Users || Ghosti",
                page : "users",
                currentUser : req.user,
                loginPage : false,
                data : {
                    users : userList[0]      
                }
            });
        }).catch((err)=>{
            if(err) throw err;
        });
});

router.post('/users', ensureAuthenticated, checkRole(['admin']),
    check("first_name", "Provide first name").not().isEmpty(),
    check("email", "Provide email").not().isEmpty(),
    check("password", "Provide password").not().isEmpty(),
(req, res, next)=>{

    var first_name = req.body.first_name,
        last_name = req.body.last_name,
        email = req.body.email,
        mobileNo = req.body.mobile_no,
        password = req.body.password;

    var errors = validationResult(req);
    
    if(!errors.isEmpty()){
        let userPromise = [
            usersList(req.user.relId)
        ];
        Promise.all(userPromise)
            .then((userList)=>{
                res.render('admin/users', {
                    errors : errors['errors'],
                    title : "Users || Ghosti",
                    page : "users",
                    currentUser : req.user,
                    loginPage : false,
                    data : {
                        users : userList[0]      
                    }
                });
            }).catch((err)=>{
                if(err) throw err;
            });
    }else{
        connection.query("INSERT INTO users SET admin_id = ?, first_name = ?, last_name = ?, email =?, mobile_no = ?, role = ?, created_date = ?, status = ?", [req.user.relId, first_name, last_name, email, mobileNo, 'user',  new Date(), 'active'], (err, results, fields)=>{
            if(err) throw err;

            // pass into varibale for bycrptjs
            let loginHashData = {
                admin_id : req.user.relId,
                user_id : results.insertId,
                username : email,
                password : password,
                role : 'user'
            };
            var loginData = loginHashData;
            
            bycrypt.hash(loginData.password, 10, (err, hash)=>{
                if(err) throw err;
                loginData.password = hash;

                connection.query("INSERT INTO login SET ?", [loginData], (err, results)=>{
                    if(err) throw err;
                });
            });
        });
        
        // req.toastr.success("Successfully added new protfolio");
        req.flash("success","<span class='fa fa-fw fa-check'></span> Successfully added new users");

        res.location('/admin/users/');
        res.redirect('/admin/users/'); // add / for relaod with
    }

});

router.post('/checkUserEmail', ensureAuthenticated, checkRole(['admin']), async(req, res, next)=>{
    var userEmailToCheck = req.body.email;
    connection.query("SELECT count(id) AS userEmailExit FROM login WHERE username =?", [userEmailToCheck], (err, userEmailCheckResult)=>{
        if(err) throw err;
        if(userEmailCheckResult[0].userEmailExit === 0){
            return res.send("true");
        }else{
            return res.send("false");
        }

    });
});
router.post('/checkUpdUserEmail', ensureAuthenticated, checkRole(['admin']), async(req, res, next)=>{
    const userEmailToCheck_upd = req.body.updEmail,
        userId_upd = req.body.userId;
    connection.query("SELECT count(id) AS userEmailExit FROM login WHERE username = ? AND user_id != ?", [userEmailToCheck_upd, userId_upd], (err, userEmailCheckResult)=>{
        if(err) throw err;
        if(userEmailCheckResult[0].userEmailExit === 0){
            return res.send("true");
        }else{
            return res.send("false");
        }

    });
});

router.get('/editUsers/:id', ensureAuthenticated, checkRole(['admin']), async (req, res, next)=>{
    const editUsersId = req.params.id;
    
    connection.query("SELECT * FROM users INNER JOIN login ON users.id = login.user_id WHERE users.id = ?", [editUsersId], (err, editUsersResult) =>{
        if(err) throw err;
        res.render('admin/editUsers', {
            editUsersData : editUsersResult[0]
        });
    });
});


router.post('/editUsers', ensureAuthenticated, checkRole(['admin']),
    check("userId", "Provide").not().isEmpty(),
    check("first_name", "Provide first name").not().isEmpty(),
    check("updEmail", "Provide email").not().isEmpty(),
(req, res, next)=>{
    var edit_userId = req.body.userId,
        edit_first_name = req.body.first_name,
        edit_last_name = req.body.last_name,
        edit_email = req.body.updEmail,
        edit_mobileNo = req.body.mobile_no,
        edit_password = req.body.password;

    var updUser_errors = validationResult(req);
    
    if(!updUser_errors.isEmpty()){
        let userPromise = [
            usersList(req.user.relId)
        ];
        Promise.all(userPromise)
            .then((userList)=>{
                res.render('admin/users', {
                    errors : updUser_errors['errors'],
                    title : "Users || Ghosti",
                    page : "users",
                    currentUser : req.user,
                    loginPage : false,
                    data : {
                        users : userList[0]      
                    }
                });
            }).catch((err)=>{
                if(err) throw err;
            });
    }else{
        connection.query("UPDATE users SET first_name = ?, last_name = ?, email =?, mobile_no = ? WHERE id = ?", [edit_first_name, edit_last_name, edit_email, edit_mobileNo, edit_userId], (err)=>{
            if(err) throw err;

            if(edit_password === undefined){
                connection.query("UPDATE login SET username = ? WHERE user_id = ?", [edit_email, edit_userId], (err)=>{
                    if(err) throw err;
                });
            }else{
                // pass into varibale for bycrptjs
                let loginHashData = {
                    username : edit_email,
                    password : edit_password,
                };
                bycrypt.hash(loginHashData.password, 10, (err, hash)=>{
                    if(err) throw err;
                    loginHashData.password = hash;
    
                    connection.query("UPDATE login SET ? WHERE user_id = ?", [loginHashData, edit_userId], (err)=>{
                        if(err) throw err;
                    });
                });
            }
        });

        req.flash("success","<span class='fa fa-fw fa-check'></span> Successfully edited users's details");

        res.location('/admin/users/');
        res.redirect('/admin/users/'); // add / for relaod with
    }

});

// delete users
router.get('/deleteUser/:id', ensureAuthenticated, checkRole(['admin']), async(req, res, next) =>{
    var userId = req.params.id;
    connection.query("DELETE FROM users WHERE id = ?", [userId], (err, results)=>{
        if(err) throw err;
        connection.query("DELETE FROM login WHERE user_id = ?", [userId], (err, loginDeleteResults)=>{
            if(err) throw err;
            res.send("done");
        })
    });
});

module.exports = router;