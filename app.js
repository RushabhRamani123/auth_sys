// app.js
const express = require('express');
const app = express();
const env = require("dotenv");
env.config();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', require('./routes/auth'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;