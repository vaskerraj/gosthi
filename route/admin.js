var express = require('express');
var router = express.Router();
var {check, validationResult} = require('express-validator');

var connection = require('../db');

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('../');
}

router.get('/', ensureAuthenticated, async (req, res, next)=>{
    res.render('admin/index', {
        title: "Index | Admin",
        page : 'index',
        loginPage : false,
        currentUser : req.user
    });
});

router.get('/users', ensureAuthenticated, async (req, res, next)=>{
    connection.query("SELECT * FROM users ORDER BY id DESC",(err, usersResult, fields) =>{
        res.render('admin/users', {
            title : "Users",
            protfolioActiveClass : true,
            currentUser : req.user,
            loginPage : false,
            page : 'users',
            portfolios : usersResult
        });
    });
});

router.post('/users', ensureAuthenticated,
    check("category", "Provide category").not().isEmpty(),
    check("title", "Provide title").not().isEmpty(),
    check("href", "Provide link").not().isEmpty(),
(req, res, next)=>{

    var category = req.body.category,
        title = req.body.title,
        href = req.body.href,
        description = req.body.description,
        build_date = req.body.create_date;

    if(req.file){
        var imageName = req.file.filename;
    }else{
        var imageName = '';
    }

    console.log(imageName);
    
    var errors = validationResult(req);
    
    if(!errors.isEmpty()){
        res.render('admin/protfolio', {
            errors : errors['errors'],
            title : "Add Protfolio",
            loginPage : false,
            page : 'protfolio',
            currentUser : req.user
        });
    }else{
        connection.query("INSERT INTO protfolio SET  category = ?, title = ?, image =?, href=?, description=?, build_date=?, created_at=?", [category, title, imageName, href, description, build_date, new Date()], (err, results, fields)=>{
            if(err) throw err;
            console.log("successfully inserted at protfolio database");
        });
        
        // req.toastr.success("Successfully added new protfolio");
        req.flash("success","Successfully added new protfolio");

        res.location('/admin/protfolio');
        res.redirect('/admin/protfolio');
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

        connection.query("INSERT INTO category SET category = ?, created_at=?  ORDER BY id DESC", [category, new Date()], (err, results, fields)=>{
            if(err) throw err;
        });
        req.flash("success", "New category sucessfully added !!!");

        res.location('/admin/category');
        res.redirect('/admin/category');
    }
});

module.exports = router;