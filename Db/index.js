// db.js
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.Password,
  database: 'auth_system',
});

connection.connect((err) => {
    if (err) {
      return;
    }
    console.log('Connected to MySQL database!');
  });

module.exports = connection;