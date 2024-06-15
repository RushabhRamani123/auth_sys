// db.js
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.host,
  user: process.env.username,
  password: process.env.Password,
  database: process.env.DBName,
});

connection.connect((err) => {
    if (err) {
      return;
    }
    console.log('Connected to MySQL database!');
  });

module.exports = connection;