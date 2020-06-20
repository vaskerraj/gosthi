var connection  = require('../db');

module.exports = {
    totalUsers : (adminId) => {
        return new Promise((reslove, reject) =>{
            connection.query("SELECT id FROM users  WHERE admin_id = ?", [adminId], (err, result) =>{
                if(err) throw err;
                reslove(result.length);
            });
        });
        
    },
    totalActiveUsers : (adminId) => {
        return new Promise((reslove, reject) =>{
            connection.query("SELECT id FROM users WHERE admin_id = ? AND status = ?", [adminId, 'active'], (err, activeResult) =>{
                if(err) throw err;
                reslove(activeResult.length);
            });
        });
        
    },
    tempHumData : (merchantId) =>{
        return new Promise((reslove, reject) =>{
            connection.query("SELECT * FROM datatemphum ORDER BY id DESC",(err, tempHumResults, fields) =>{
                if(err) throw err;
                var row = JSON.parse(JSON.stringify(tempHumResults[0]));
                reslove(row);
            });
        });
    },
    totalDevices : (merchantId) =>{
        return new Promise((reslove, reject) =>{
            connection.query("SELECT id AS total FROM iotdevice WHERE mId = ?",[merchantId],(err, totaldevice, fields) =>{
                if(err) throw err;
                reslove(totaldevice.length);
            });
        });
    }
}