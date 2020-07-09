var express = require('express');
var router = express.Router();
var bycrypt = require('bcryptjs');
var {check, validationResult} = require('express-validator');

const { ensureAuthenticated, checkRole } = require('../config/auth');

var connection = require('../db');

const { totalUsers, totalActiveUsers } = require('../models/dashboard');
const { meetingRooms, upcomingMeetingRooms, inviteUsersList } = require('../models/meeting');
const { usersList } = require('../models/users');
const { JSON } = require('mysql/lib/protocol/constants/types');

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
            meetingRooms(req.user.relId),
            upcomingMeetingRooms(req.user.relId)
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
                        rooms : meeting[0],
                        upcoming : meeting[1]
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
            console.log("successfully inserted at meeting database");
        });
        
        // req.toastr.success("Successfully added new protfolio");
        req.flash("success","Successfully created new meeting");

        res.location('/admin/');
        res.redirect('/admin/');
    }

});

router.post('/meetingDetails', ensureAuthenticated, checkRole(['admin']), async (req, res, next)=>{
    var meetingId = req.body.id;
    connection.query("SELECT * FROM meeting WHERE id = ?", [meetingId], (err, meetingDetails)=>{
        if(err) throw err;
        return res.status(200).json(meetingDetails[0]);
    });
});

router.get('/users', ensureAuthenticated, checkRole(['admin']), async (req, res, next)=>{
    console.log(req.user);
    let userPromise = [
        usersList(req.user.relId)
    ];

    Promise.all(userPromise)
        .then((userList)=>{
            console.log(userList);
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
                    console.log("login database");
                });
            });
            console.log("successfully inserted at users database");
        });
        
        // req.toastr.success("Successfully added new protfolio");
        req.flash("success","Successfully added new users");

        res.location('/admin/users');
        res.redirect('/admin/users');
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

//  for super admi purpose to create admin
router.post('/spusers', ensureAuthenticated,
    check("first_name", "Provide first name").not().isEmpty(),
    check("email", "Provide email").not().isEmpty(),
    check("contactNo", "Provide contact number").not().isEmpty(),
    check("username", "Provide username").not().isEmpty(),
    check("password", "Provide password").not().isEmpty(),
    check("contactPerson", "Provide contact person name").not().isEmpty(),
(req, res, next)=>{

    var first_name = req.body.first_name,
        last_name = req.body.last_name,
        email = req.body.email,
        contactNo = req.body.contactNo,
        address = req.body.address,
        username = req.body.username,
        password = req.body.password,
        contactPerson = req.body.contactPerson,
        contactPersonMobile = req.body.contactPersonMobile;
    
    var errors = validationResult(req);
    
    if(!errors.isEmpty()){
        let userPromise = [
            usersList(req.user.userId)
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
        connection.query("INSERT INTO users SET  first_name = ?, last_name = ?, email =?, contact_no = ?, address = ?, contact_person = ?, role = ?, created_date = ?, status = ?", [first_name, last_name, email, contactNo, address, contactPerson, 'user',  new Date(), 'active'], (err, results, fields)=>{
            if(err) throw err;

            // pass into varibale for bycrptjs
            let loginHashData = {
                user_id : req.user.userId,
                username : username,
                password : password,
                role : 'user'
            };
            var loginData = loginHashData;
            
            bycrypt.hash(loginData.password, 10, (err, hash)=>{
                if(err) throw err;
                loginData.password = hash;

                connection.query("INSERT INTO login SET ?", [loginData], (err, results)=>{
                    console.log("login database");
                });
            });
            console.log("successfully inserted at users database");
        });
        
        // req.toastr.success("Successfully added new protfolio");
        req.flash("success","Successfully added new users");

        res.location('/admin/users');
        res.redirect('/admin/users');
    }

});

module.exports = router;