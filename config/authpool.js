const mysql = require('mysql2');

const pool = mysql.createPool({
    host:"dentalmysql.cc6ydrz3sjwp.us-east-1.rds.amazonaws.com",
    user:"adminuser",
    password:"adminuser",
    database:"justdentaldb",
    connectionLimit : 10,
    multipleStatements: true
});

// const pool = mysql.createPool({
//     host:"127.0.0.1",
//     user:"root",
//     password:"rootpasswordgiven",
//     database:"justdentaldb",
//     connectionLimit : 10,
//     multipleStatements: true
// });

module.exports = pool.promise();

