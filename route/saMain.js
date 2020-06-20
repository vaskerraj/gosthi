var express = require('express');
var router = express.Router();
var bycrypt = require('bcryptjs');
var {check, validationResult} = require('express-validator');

var connection = require('../db');

const { totalUsers, totalActiveUsers } = require('../models/dashboard');
const { usersList } = require('../models/users');

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
            res.render('admin/index', {
                title: "Index | Admin",
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

router.get('/users', ensureAuthenticated, async (req, res, next)=>{
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

router.post('/users', ensureAuthenticated,
    check("first_name", "Provide first name").not().isEmpty(),
    check("username", "Provide username").not().isEmpty(),
    check("password", "Provide password").not().isEmpty(),
(req, res, next)=>{

    var first_name = req.body.first_name,
        last_name = req.body.last_name,
        email = req.body.email,
        mobileNo = req.body.mobile_no,
        username = req.body.username,
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
                users_admin_id : req.user.relId,
                user_id : results.insertId,
                username : username,
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

router.get('/deleteUser/:id', ensureAuthenticated, async(req, res, next) =>{
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

router.get('/category', ensureAuthenticated, async (req, res, next)=>{

    connection.query("SELECT * FROM category",(err, categories)=>{
        if(err) throw err;

        res.render('admin/category', {
            title : "Category",
            categoryActiveClass : true,
            currentUser : req.user,
            loginPage : false,
            page : 'category',
            category : categories
        });
    });
});

router.post('/category', ensureAuthenticated,
    check("category","Prrovide category").not().isEmpty(),
(req,res, next) =>{ 
    var category = req.body.category;

    var categoryError = validationResult(req);

    if(!categoryError.isEmpty()){

        res.render('admin/category',{
            errors : categoryError['errors'],
            title : 'Category',
            categoryActiveClass : true,
            loginPage : false,
            page : 'protfolio',
            currentUser : req.user
        });

    }else{

        connection.query("INSERT INTO users SET category = ?, created_at=?  ORDER BY id DESC", [category, new Date()], (err, results, fields)=>{
            if(err) throw err;
        });
        req.flash("success", "New category sucessfully added !!!");

        res.location('/admin/category');
        res.redirect('/admin/category');
    }
});

module.exports = router;