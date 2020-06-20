const createError = require('http-errors'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    express = require('express'),
    flash = require("connect-flash"),
    ejs = require('ejs'),
    expressValidator = require("express-validator"),
    session = require("express-session"),
    passport = require("passport");

// connect mysql
var mysql = require('./db');
// connection.connect();

const indexRoute = require('./route/index');
const adminRoute = require('./route/admin');
const loginRoute = require('./route/login');

// superadmin
const SARoute = require('./route/saMain');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('views', __dirname  + '/views');

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(cookieParser('portfolioSecret'));
app.use(session({
    secret : "jhostiSecrete",
    saveUninitialized : true,
    resave : true
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(flash());
// app.use(toastr());
app.use(function (req, res, next) {
    // express message
    // adding () for handlebars not need for other templete engine

    res.locals.messages = require('express-messages')(req, res)(); 
    // var hh = res.locals.messages;
    // console.log(hh());

    // res.locals.toasts = req.toastr.render();
    
    next();
});

app.use('/', indexRoute);
app.use('/login',loginRoute);
app.use('/admin', adminRoute);

// superadmin
app.use('/SA',SARoute);

app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server is running");
});