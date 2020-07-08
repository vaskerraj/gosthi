const connection = require('../db');

module.exports = {
    // USER LIST AT ADMIN PAGE
    meetingRooms : (admin_id) =>{
        return new Promise((reslove, reject)=>{
            connection.query("SELECT * FROM meeting WHERE admin_id = ? AND type = ? ORDER BY id DESC", [admin_id, 'normal'],(err, results)=>{
                if(err) throw err;
                var row = JSON.parse(JSON.stringify(results));
                console.log(row);
                reslove(row);
            });
        });
    },
    upcomingMeetingRooms : (admin_id) =>{
        return new Promise((reslove, reject)=>{
            connection.query("SELECT * FROM meeting WHERE admin_id = ? AND type = ? AND meeting_date <= CURDATE() ORDER BY id DESC", [admin_id, 'schedule'],(err, results)=>{
                if(err) throw err;
                const created_date = results.created_at;
                console.log(created_date);
                var row = JSON.parse(JSON.stringify(results));
                console.log(row);
                reslove(row);
            });
        });
    },
    inviteUsersList : (admin_id) =>{
        new Promise((reslove, reject) =>{
            connection.query("SELECT users.first_name, users.last_name, login.username FROM users INNER JOIN login ON users.admin_id = login.admin_id WHERE users.admin_id = ? AND users.status", [admin_id, 'active'],(err, userListResult)=>{
                if(err) throw err;
                console.log(userListResult);
            });
        });
    }
}