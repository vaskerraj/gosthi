
var connection = require('../db');

module.exports = {
    meetingId : () =>{
        return new Promise((reslove, reject)=>{
            connection.query("SELECT * FROM meeting ORDER BY id DESC LIMIT 1", (err, instantMeetResults)=>{
                if(err) throw err;
                const meetingId =  (instantMeetResults[0].meeting_id == '') ? '100000000' : instantMeetResults[0].meeting_id + 1;
                // console.log(`meetingId : ${meetingId}`);
                reslove(JSON.parse(JSON.stringify(meetingId)));
            });
        });
    }
}