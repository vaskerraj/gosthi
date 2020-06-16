const mysql = require('mysql');

var pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'gosthi',
    connectionLimit : 1000
});

module.exports = pool;