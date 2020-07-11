const { MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_DATABASE } = require('./config/index');
const mysql = require('mysql');

var pool = mysql.createPool({
    host : MYSQL_HOST,
    user : MYSQL_USER,
    password : MYSQL_PASS,
    database : MYSQL_DATABASE,
    connectionLimit : 1000
});

module.exports = pool;