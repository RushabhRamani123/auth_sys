const request = require('supertest');
const app = require('../app'); // Assuming your Express app is exported from app.js
const db = require('../Db/index'); // Assuming your database connection is exported from db.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
describe('POST /api/register', () => {
  let server;

  beforeAll(async () => {
    // Clear the users table before running tests
    await db.query('TRUNCATE TABLE users');

    // Start the server
    server = app.listen();
  });

    afterAll(async () => {
      await db.query('DELETE FROM users');
  });


  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should not register a user with an existing username', async () => {
    // Register a user first
    await request(app)
      .post('/api/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

    const response = await request(app)
      .post('/api/register')
      .send({
        username: 'testuser', // Same username
        email: 'another@example.com', // Different email
        password: 'anotherpassword',
      });

    expect(response.statusCode).toBe(409); // Assuming you handle the duplicate username error with a 500 status code
    expect(response.body).toHaveProperty('error', 'Username already exists');
  });

  it('should not register a user with an existing email', async () => {
    // Register a user first
    await request(app)
      .post('/api/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

    const response = await request(app)
      .post('/api/register')
      .send({
        username: 'anotheruser', // Different username
        email: 'test@example.com', // Same email
        password: 'anotherpassword',
      });

    expect(response.statusCode).toBe(409); // Assuming you handle the duplicate email error with a 500 status code
    expect(response.body).toHaveProperty('error', 'Email already exists');
  });
});

describe('POST /api/login', () => {
  let testUser;

  beforeAll(async () => {
    // Create a test user in the database before running the tests
    const hashedPassword = await bcrypt.hash('password1123', 10);
    await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', ['testuser1', 'test@example1.com', hashedPassword]);

    testUser = {  username: 'testuser1', email: 'test@example1.com', password: 'password1123' };
  });

  afterAll(async () => {
    // Clean up and delete the test user from the database after running the tests
    await db.query('DELETE FROM users WHERE email = ?', [testUser.email]);
  });

  it('should return a JWT token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');

    // Verify the JWT token
    const decoded = jwt.verify(response.body.token,'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    expect(decoded).toHaveProperty('email', testUser.email);
  });

  it('should return an error for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: testUser.email, password: 'wrongpassword' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('should return an error for non-existing user', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });
});

describe('GET /api/profile', () => {
  let token;

  beforeAll(async () => {
    // Clear the users table before running tests
    await db.query('TRUNCATE TABLE users');

    // Register a user and retrieve a JWT token
    const registerResponse = await request(app)
      .post('/api/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    const parsedResponse = JSON.parse(loginResponse.text);
    token = parsedResponse.token;
  });


  afterAll(async () => {
    // Close the server and the database connection
    await db.query("DELETE FROM users");
  });
  
  it('should return the user profile', async () => {
    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });

});

