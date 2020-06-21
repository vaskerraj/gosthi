var express = require('express');
var router = express.Router();
var bycrypt = require('bcryptjs');
var {check, validationResult} = require('express-validator');

var connection = require('../db');

const { totalUsers, totalActiveUsers } = require('../models/dashboard');
const { adminList } = require('../models/admins');

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('../');
}

router.get('/', ensureAuthenticated, async (req, res, next)=>{
    let dashbaordPromise = [
        totalUsers(req.user.relId),
        totalActiveUsers(req.user.relId)
    ];
    Promise.all(dashbaordPromise).
        then((dashboardContent)=>{
            res.render('SA/index', {
                title: "Index | SA",
                page : 'index',
                loginPage : false,
                currentUser : req.user,
                data : {
                    totalUser : dashboardContent[0],
                    totalActiveUsers : dashboardContent[1]
                }
            });
        });
});

router.get('/admins', ensureAuthenticated, async (req, res, next)=>{
    console.log(req.user);
    let userPromise = [
        adminList(req.user.relId)
    ];

    Promise.all(userPromise)
        .then((adminList)=>{
            res.render('SA/createAdmin', {
                title : "Admins || Ghosti",
                page : "users",
                currentUser : req.user,
                loginPage : false,
                data : {
                    admins : adminList[0]      
                }
            });
        }).catch((err)=>{
            if(err) throw err;
        });
});
router.post('/admins', ensureAuthenticated,
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
            adminList(req.user.userId)
        ];
        Promise.all(userPromise)
            .then((adminList)=>{
                res.render('SA/createAdmin', {
                    errors : errors['errors'],
                    title : "Admins || Ghosti",
                    page : "users",
                    currentUser : req.user,
                    loginPage : false,
                    data : {
                        admins : adminList[0]      
                    }
                });
            }).catch((err)=>{
                if(err) throw err;
            });
    }else{
        connection.query("INSERT INTO admin_user SET  first_name = ?, last_name = ?, email =?, contact_no = ?, address = ?, contact_person = ?, contact_person_mobile = ?, role = ?, created_date = ?, status = ?", [first_name, last_name, email, contactNo, address, contactPerson, contactPersonMobile, 'admin',  new Date(), 'active'], (err, results, fields)=>{
            if(err) throw err;

            // pass into varibale for bycrptjs
            let loginHashData = {
                users_admin_id : results.insertId,
                username : username,
                password : password,
                role : 'admin'
            };
            var loginData = loginHashData;
            
            bycrypt.hash(loginData.password, 10, (err, hash)=>{
                if(err) throw err;
                loginData.password = hash;

                connection.query("INSERT INTO login SET ?", [loginData], (err, results)=>{
                    console.log("login database");
                });
            });
            console.log("successfully inserted at admin database");
        });
        
        req.flash("success","Successfully added new admin");

        res.location('/SA/admins');
        res.redirect('/SA/admins');
    }

});

// manage admins

router.get('/manageAdmin/:id', ensureAuthenticated, async(req, res, next) =>{
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