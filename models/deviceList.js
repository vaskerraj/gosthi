var connection  = require('../db');

module.exports = {
    deviceList : (merchantId) => {
        return new Promise((reslove, reject) =>{
            connection.query("SELECT iotdevice.id, iotdevice.name, iotdevice.deviceName, iotdevice.cDate AS device_created_at, datatemphum.temp, datatemphum.humidity, FROM_UNIXTIME(datatemphum.cDate, '%Y-%m-%d %H:%i:%s') AS temphum_date FROM iotdevice LEFT JOIN datatemphum ON iotdevice.id = datatemphum.deviceId  WHERE iotdevice.mId = ? GROUP BY iotdevice.name ORDER BY datatemphum.id DESC", [merchantId], (err, result) =>{
                if(err) throw err;
                var row = JSON.parse(JSON.stringify(result));
                reslove(row);
            });
        });
    },
    deviceDetails : (merchantId, deviceId) =>{
        return new Promise((reslove, reject)=>{
            connection.query("SELECT * FROM iotdevice WHERE id = ?", [deviceId], (err, devices)=>{
                var row = JSON.parse(JSON.stringify(devices[0]));
                console.log(row);
                reslove(row);
            });
        });
    },
    deviceReport : (merchantId, deviceId, rel) =>{
        return new Promise((reslove, reject)=>{
            connection.query("SELECT * FROM datatemphum WHERE deviceId = ?", [deviceId], (err, reportResult)=>{
                var row = JSON.parse(JSON.stringify(reportResult));
                reslove(row);
            });
        });
    }
}