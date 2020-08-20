const mysql = require('mysql2');


const pool = mysql.createPool({
    host:"dentalmysql.cc6ydrz3sjwp.us-east-1.rds.amazonaws.com",
    user:"adminuser",
    password:"adminuser",
    database:"opendental",
    connectionLimit : 10,
});
/*
const pool = mysql.createPool({
    host:"127.0.0.1",
    user:"root",
    password:"rootpasswordgiven",
    database:"opendental",
    connectionLimit : 10,
});
*/
module.exports = pool.promise();
