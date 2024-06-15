// routes/auth.js
const express = require('express');
const router = express.Router();
const auth = require("../controller/auth") 
// Register a new user
router.post('/register',auth.Register);

// Login a user
router.post('/login', auth.Login);

// Middleware to verify the JWT


// Get the logged-in user's profile (protected endpoint)
router.get('/profile', auth.VerifyToken, auth.Profile);

module.exports = router;