const connection = require('../db');

module.exports = {
    // ADMIN LIST AT SUPER ADMIN PAGE
    adminList : (admin_id) =>{
        console.log(`admin_id: ${admin_id}`);
        return new Promise((reslove, reject)=>{
            connection.query("SELECT admin_user.id, admin_user.first_name, admin_user.last_name, admin_user.email, admin_user.address, admin_user.contact_no, admin_user.contact_person, admin_user.contact_person_mobile, login.username FROM admin_user JOIN login ON admin_user.id = login.admin_id WHERE admin_user.id = ?", [admin_id],(err, results)=>{
                if(err) throw err;
                var row = JSON.parse(JSON.stringify(results));
                reslove(row);
            });
        });
    }
}