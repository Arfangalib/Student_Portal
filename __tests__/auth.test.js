const request = require('supertest');
const app = require('../server');
const mysql = require('mysql');

// MySQL database connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'galibali123',
    database: 'student_portal'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Before each test, clear the relevant tables to ensure test isolation
beforeEach((done) => {
    db.query('DELETE FROM discussion', (err) => {
        if (err) {
            console.error('Error clearing discussion table:', err);
            return done(err);
        }
        db.query('DELETE FROM users', (err) => {
            if (err) {
                console.error('Error clearing users table:', err);
                return done(err);
            }
            done();
        });
    });
});

// Close the database connection after all tests
afterAll((done) => {
    db.end(done);
});

// Test cases for the auth routes
describe('Auth Routes', () => {
    it('should register a new user', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'testpassword'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Registration successful');
    });

    it('should not register a user with an existing email', async () => {
        await request(app)
            .post('/api/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'testpassword'
            });

        const response = await request(app)
            .post('/api/register')
            .send({
                name: 'Another User',
                email: 'test@example.com',
                password: 'anotherpassword'
            });

        expect(response.statusCode).toBe(400); // Adjusted status code
        expect(response.body.message).toBe('Email already in use'); // Added proper error message check
    });

    it('should login an existing user', async () => {
        await request(app)
            .post('/api/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'testpassword'
            });

        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'test@example.com',
                password: 'testpassword'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.token).toBeDefined();
    });

    it('should not login a user with incorrect password', async () => {
        await request(app)
            .post('/api/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'testpassword'
            });

        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword'
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Invalid email or password');
    });
});


