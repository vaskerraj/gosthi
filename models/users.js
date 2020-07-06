const connection = require('../db');

module.exports = {
    // USER LIST AT ADMIN PAGE
    usersList : (admin_id) =>{
        console.log(admin_id);
        return new Promise((reslove, reject)=>{
            connection.query("SELECT users.id, users.first_name, users.last_name, users.email, users.mobile_no, login.username FROM login JOIN users ON users.id = login.user_id WHERE login.admin_id = ? ORDER BY login.id DESC", [admin_id],(err, results)=>{
                if(err) throw err;
                var row = JSON.parse(JSON.stringify(results));
                reslove(row);
            });
        });
    }
}