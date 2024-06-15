const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../Db/index');
/*  // Hash the password
   
  */ 
 const Register = async (req, res) => {
  const { username, email, password } = req.body;

 
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword],
      async (err) => {
        if(err) {
          if (err.code === 'ER_DUP_ENTRY') {
            // Handle duplicate entry error
            if (err.sqlMessage.toLowerCase().includes('username')) {
              res.status(409).json({ error: 'Username already exists' });
            } else if (err.sqlMessage.toLowerCase().includes('email')) {
              res.status(409).json({ error: 'Email already exists' });
            } else {
              res.status(500).json({ error: 'Internal server error' });
            }
          } else {
            // Handle other errors
            res.status(500).json({ error: 'Internal server error' });
          }
        }
        else {
          
          res.status(201).json({ message: 'User registered successfully' });
        }
      }
    ); 
}
 const Login = (req, res) => {
    const { email, password } = req.body;
  
    // Check if the user exists in the database
    db.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        if (results.length === 0) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
  
        const user = results[0];
  
        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
  
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
  
        // Generate a JWT
        const token = jwt.sign({ email: user.email  },process.env.JWT_SCERET_KEY, {
          expiresIn: '1h',
        });
  
        res.json({ token });
      }
    );
}
  
 const VerifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
  
    try {
      const decoded = jwt.verify(token, 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
      req.email = decoded.email;
      next();
    } catch (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
};
  
 const Profile = (req, res) => {
    const Email = req.email;
    // Retrieve  user's profile from the database
    db.query(
      'SELECT username, email FROM users WHERE email = ?',
      [Email],
      (err, results) => {
        if (err) {
         
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
  
        const user = results[0];
        res.json(user);
      }
    );
}

module.exports = {
    Register,
    Login,
    VerifyToken,
    Profile
  }