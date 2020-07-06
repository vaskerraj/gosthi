const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');

const connection = require('../db');


const userLogin = (usersCreds, role, res) =>{
    let { username, password } = usersCreds;

    // let username = "user";
    // let password = "$2a$10$7f2JY/3/TI18gGswOghHEuV4NMVra3UHpP5517tjK75T5z6RnBT2W";


    connection.query("select * from login where username = ?", [username], (err, rows)=>{
        if(err) return done(err);
        if(!rows.length){
            return res.status(404).json({
                message: "Username is not found. Invalid login credentials.",
                success: false
            });
        }else {

            // check role of user
            if (rows[0].role !== role) {
                return res.status(403).json({
                message: "Please make sure you are logging in from the right portal.",
                success: false
                });
            }

            bcrypt.compare(password, rows[0].password, (err, isMatch)=>{
                if(isMatch){
                    let token = jwt.sign(
                        {
                            user_id: rows[0].id,
                            role: rows[0].role,
                            username: rows[0].username
                        },
                        SECRET,
                        { expiresIn: "7 days" }
                        );
        
                        let result = {
                            username: rows[0].username,
                            role: rows[0].role,
                            token: `JWT ${token}`,
                            expiresIn: 168
                        };
        
                        return res.status(200).json({
                            ...result,
                            message: "Hurray! You are now logged in.",
                            success: true
                        });
                  }else{
                    return res.status(403).json({
                        message: "Incorrect password.",
                        success: false
                    });
                    // return done(null, false, {messages : "Invalid password"});
                  }
            });
        }
    });
}

const userAuth = passport.authenticate("jwt", { session: true });

/**
 *  Check Role Middleware
 */

const checkRole = roles => (req, res, next) =>
    !roles.includes(req.user.role)
    ? res.status(401).json("Unauthorized")
    : next();


const serializeUser = user => {
  return {
    username: user.username,
    name: user.name,
    id: user.id,
  };
};

module.exports = {
  userAuth,
  checkRole,
  userLogin,
  serializeUser
};