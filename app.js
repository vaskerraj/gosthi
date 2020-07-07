const createError = require('http-errors'),
    cors = require("cors"),
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

const { PORT } = require("./config");
// connection.connect();

const indexRoute = require('./route/index');
const adminRoute = require('./route/admin');
const loginRoute = require('./route/login');

// superadmin
const SARoute = require('./route/saMain');

var app = express();


// Passport Config
require('./middlewares/passport')(passport);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('views', __dirname  + '/views');

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(cookieParser('ghostiSecrete'));
app.use(session({
    secret : "ghostiSecrete",
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
app.use('/admin', adminRoute);

// superadmin
app.use('/SA',SARoute);

app.listen(PORT || 3000, ()=>{
    console.log("Server is running");
});