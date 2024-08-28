const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_portal'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

const jwtSecret = 'your_jwt_secret';

// Middleware to verify JWT and attach user info to request
function authenticateToken(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Register a new user
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting user into database:', err);
                return res.status(500).send('Server error');
            }
            res.send({ message: 'Registration successful' });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Login a user
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error fetching user from database:', err);
            return res.status(500).send('Server error');
        }
        if (results.length === 0) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, jwtSecret, { expiresIn: '1h' });
        res.send({ message: 'Login successful', token });
    });
});

// Fetch all courses
app.get('/api/courses', authenticateToken, (req, res) => {
    const query = 'SELECT id, name, description FROM courses'; // Make sure 'description' is included
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching courses from database:', err);
            return res.status(500).send('Server error');
        }
        res.send(results);
    });
});


// Fetch all discussion comments
app.get('/api/discussion', (req, res) => {
    const query = `
        SELECT discussion.id, discussion.comment, users.name 
        FROM discussion 
        JOIN users ON discussion.user_id = users.id
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching discussion from database:', err);
            return res.status(500).send('Server error');
        }
        res.send(results);
    });
});

// Post a comment in the discussion
app.post('/api/discussion', authenticateToken, (req, res) => {
    const { comment } = req.body;
    const query = 'INSERT INTO discussion (user_id, comment) VALUES (?, ?)';
    db.query(query, [req.user.id, comment], (err, result) => {
        if (err) {
            console.error('Error inserting comment into database:', err);
            return res.status(500).send('Server error');
        }
        res.send({ message: 'Comment posted successfully' });
    });
});

// Fetch user information (for dashboard)
app.get('/api/user-info', authenticateToken, (req, res) => {
    res.send({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});
// Add a book
app.post('/books', authenticateToken, (req, res) => {
    const { course_id, title, author, isbn } = req.body;
    const query = 'INSERT INTO books (course_id, title, author, isbn) VALUES (?, ?, ?, ?)';
    db.query(query, [course_id, title, author, isbn], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).send({ id: result.insertId, message: 'Book added successfully!' });
    });
});
// Get books
app.get('/books/:course_id', authenticateToken, (req, res) => {
    const { course_id } = req.params;
    const query = 'SELECT * FROM books WHERE course_id = ?';
    db.query(query, [course_id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(results);
    });
});
// Delete books
app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM books WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ message: 'Book deleted successfully!' });
    });
});


// Only start the server if this script is not being required by another module
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export the app for testing purposes
module.exports = app;
