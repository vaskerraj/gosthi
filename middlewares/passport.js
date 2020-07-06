const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

var connection = require('../db');

module.exports = function(passport) {
    passport.use(new LocalStrategy( (username, password, done)=>{
        connection.query("select * from login where username = ?", [username], (err, rows)=>{
            if(err) return done(err);
            if(!rows.length){
                return done (null, false , { messages: "Email address not found"});
            }
            bcrypt.compare(password, rows[0].password, (err, isMatch)=>{
                if(isMatch){
                    return done(null, rows[0]);
                }else{
                    return done(null, false, {messages : "Invalid password"});
                }
            });
        });
    }));

    passport.serializeUser((user, done)=>{
        return done(null, user.id);
    });
    
  
    passport.deserializeUser((id, done)=>{

        connection.query('SELECT role FROM login WHERE id = '+id, (err, rows) => {
            if(rows[0].role == "admin" || rows[0].role == "superadmin"){
                var sqlQuery = "SELECT login.id, admin_user.id AS relId ,login.username, admin_user.first_name, admin_user.last_name, admin_user.email, admin_user.role FROM admin_user INNER JOIN login ON admin_user.id = login.admin_id WHERE login.id = "+id;
            }else if(rows[0].role == "user"){
                var sqlQuery = "SELECT login.id, login.admin_id, users.id AS relId, login.username, users.first_name, users.last_name, users.email, users.role FROM users INNER JOIN login ON users.id = login.user_id WHERE login.id = "+id;
            }
            connection.query(sqlQuery, (error, rowss)=>{
                if(error) throw error;
                return done(error, rowss[0]);
            });
         });
    });
};
