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
                var row = JSON.parse(JSON.stringify(results));
                console.log(row);
                reslove(row);
            });
        });
    },
    inviteUsersList : (admin_id) =>{
        return new Promise((reslove, reject) =>{
            connection.query("SELECT * FROM users INNER JOIN login ON users.id = login.user_id WHERE login.admin_id = ?",[admin_id], (err, userListResult)=>{
                console.log(userListResult);
                if(err) throw err;
                var inviteUserList = JSON.parse(JSON.stringify(userListResult));
                reslove(inviteUserList);
            });
        });
    }
}