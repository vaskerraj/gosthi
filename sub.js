const mqtt = require('mqtt');
const mysql = require('./db');
const moment = require('moment');

const BeaconParse = require('./ble/parser');
var hello = JSON.stringify('{"cmd":"publish","retain":true,"qos":0,"dup":false,"length":282,"topic":"gwt/ble/office","payload":{"type":"Buffer","data":[123,34,109,115,103,34,58,34,97,100,118,68,97,116,97,34,44,34,103,109,97,99,34,58,34,68,48,51,51,48,52,48,48,48,57,54,50,34,44,34,111,98,106,34,58,91,123,34,100,109,97,99,34,58,34,70,56,70,56,50,65,51,70,50,51,65,67,34,44,34,114,115,115,105,34,58,34,45,57,48,34,44,34,100,97,116,97,49,34,58,34,48,50,48,49,48,54,49,65,70,70,52,67,48,48,48,50,49,53,69,50,67,53,54,68,66,53,68,70,70,66,52,56,68,50,66,48,54,48,68,48,70,53,65,55,49,48,57,54,69,48,48,48,48,48,48,48,48,48,67,53,34,125,44,123,34,100,109,97,99,34,58,34,48,48,56,55,50,70,51,70,50,51,65,67,34,44,34,114,115,115,105,34,58,34,45,52,51,34,44,34,100,97,116,97,49,34,58,34,48,50,48,49,48,54,48,51,48,51,65,65,70,69,49,49,49,54,65,65,70,69,50,48,48,48,48,66,67,68,48,68,48,48,48,48,49,57,70,65,48,54,48,68,68,56,57,51,50,50,34,125,93,44,34,115,101,113,34,58,49,51,48,56,52,125,10]}}');
// var hh = BeaconParse.parse(hello);
// console.log(hh);
module.exports = (io)=>{

    tempHumAddDot = (number) =>{
        var number = number.toString();
        var length = number.toString().length;
        if(length === 3){
            return number = number.replace(/(..?)/g, '$1.').slice(0,-1);
        }else if(length === 4){
            return number = number.replace(/(...?)/g, '$1.').slice(0, 5);
        }else{
            return number = number.replace(/(.?)/g, '$1.').slice(0,-2);
        }
    }

    insertTempHum = (humidity, temp) =>{
        console.log(humidity, temp);

        mysql.getConnection((err, connection)=>{
            if(err){
                connection.release();
                throw err;
            }

            connection.query("INSERT INTO ")
        });
    }

    // var client  = mqtt.connect('tcp://15.206.115.114')
    var client = mqtt.connect('tcp://15.206.115.114', 
                                { username: 'ubuntu', password: 'Mosquitto@' }
                            );

    parseBlePacket = (data) =>{
        console.log(data);
    }

    client.on('connect', function () {
        console.log("connect successfully");
        client.subscribe('gwt/ble/office',{qos:1});
    });
    // iot_ED/ED001/ED001-GW/43237636:36354750:05d7ff36/device/sensor_data
    // gwt/ble/office

    // 0201061AFF4C000215E2C56DB5DFFB48D2B060D0F5A71096E000000000C5

    // 0201060303AAFE1116AAFE20000BCD0D000019FA060DD89322
    
    // socket.io on connect
    io.on('connection', (socket)=>{
        console.log("Socket connected");

        // MQTT ON MESSAGE
        client.on('message', function (topic, message, payload) {
            console.log(`${topic} / message : ${message}`);
            console.log(JSON.stringify(payload));
            if(topic !== 'jxct'){
                context = JSON.parse(message);
                BLEPacketObj = context.obj;
                if(BLEPacketObj !== undefined){
                    console.log(BLEPacketObj);
                    BLEPacketObj.forEach((obj)=>{
                        parseBlePacket(obj.data1);
                    });
                } else if(context.humidity !== ''){
                    var humidity = tempHumAddDot(context.humidity),
                        temp = tempHumAddDot(context.env_temp);
                    console.log(`Humidity:${humidity} and temp : ${temp}` );
                    // insert into database

                    // insertTempHum(humidity, temp);

                    socket.emit('new npk_data', {spot_name: "OFFICE", data : {humidity : humidity, temp: temp }});
                }
            }else{
                // TOPIC => jxct
                var jxctContext = message.toString();
                console.log(jxctContext);
            }
        })

        // mysql.getConnection((err, connection)=>{
        //     console.log('on get connection');
        //     if(err){
        //         connection.release();
        //         return;
        //     }
        //     connection.query("SELECT * FROM npkdata ORDER BY id DESC", (err, result) =>{
        //         if(err) throw err;
        //         if(result.length>0){
        //             console.log('emit new npk_data');
        //             socket.emit('new npk_data', result[0]);
        //         }else{
        //             socket.emit('error');
        //         }
        //         connection.release();
        //     });
        // });
    });
    
}