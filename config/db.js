// config/db.js
const mysql = require('mysql2');

// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'mymaria@2025',
//   database: 'shopdb',
//   connectionLimit: 10,
//   port: 5210
// });

const pool = mysql.createPool({
    host: 'sql108.infinityfree.com',
    user: 'if0_38813002',
    password: 'CQ4DkXaCvs',
    database: 'if0_38813002_shopdb',
    port: 3306
  });

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database: ', err);
    return;
  }
  console.log('Connected to the database');
  connection.release();
});

module.exports = pool;
