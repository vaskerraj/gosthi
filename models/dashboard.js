var connection  = require('../db');

module.exports = {
    npkdata : (merchantId) => {
        return new Promise((reslove, reject) =>{
            connection.query("SELECT * FROM iotdevice LEFT JOIN datatemphum ON iotdevice.id = datatemphum.deviceId  WHERE iotdevice.mId = ? GROUP BY iotdevice.name ORDER BY datatemphum.id DESC", [merchantId], (err, result) =>{
                if(err) throw err;
                var row = JSON.parse(JSON.stringify(result));
                reslove(row);
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