import { fetchCourses } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const coursesLink = document.getElementById('courses-link');
    const discussionLink = document.getElementById('discussion-link');
    const booksLink = document.getElementById('books-link');
    const logoutLink = document.getElementById('logout-link');
    const userInfo = document.getElementById('user-info');

    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const coursesSection = document.getElementById('courses-section');
    const discussionSection = document.getElementById('discussion-section');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const discussionForm = document.getElementById('discussion-form');

    function updateUIForLoginStatus() {
        const token = localStorage.getItem('token');
        const userNameSpan = document.getElementById('user-name');
        const userEmailSpan = document.getElementById('user-email');

        if (token) {
            loginLink.style.display = 'none';
            registerLink.style.display = 'none';
            logoutLink.style.display = 'inline-block';
            coursesLink.style.display = 'inline-block';
            discussionLink.style.display = 'inline-block';
            booksLink.style.display = 'inline-block';
            userInfo.style.display = 'block';

            fetch('/api/user-info', {
                headers: { 'Authorization': token }
            })
            .then(response => response.json())
            .then(userInfo => {
                userNameSpan.textContent = userInfo.name;
                userEmailSpan.textContent = userInfo.email;
            });

            showSection(coursesSection);
            fetchCourses();
        } else {
            loginLink.style.display = 'inline-block';
            registerLink.style.display = 'inline-block';
            logoutLink.style.display = 'none';
            coursesLink.style.display = 'none';
            discussionLink.style.display = 'none';
            booksLink.style.display = 'none';
            userInfo.style.display = 'none';
            showSection(loginSection);
        }
    }
    // Call this function right after setting the token
    function onSuccessfulLogin() {
        updateUIForLoginStatus();
        fetchCourses(); // Ensures courses are fetched after login
    }

    function showSection(section) {
        const sections = document.querySelectorAll('main > section');
        sections.forEach((s) => (s.style.display = 'none'));
        if (section) {
            section.style.display = 'block';
        }
    }

    // Fetch and display discussion comments
    function fetchDiscussion() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User not logged in. Cannot fetch discussion.');
            return;
        }

        fetch('/api/discussion', {
            headers: { 'Authorization': token },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch discussion');
            }
            return response.json();
        })
        .then(discussion => {
            const discussionList = document.getElementById('discussion-list');
            if (discussionList) {
                discussionList.innerHTML = '';
                discussion.forEach((comment) => {
                    const commentItem = document.createElement('li');
                    commentItem.textContent = `${comment.name}: ${comment.comment}`;
                    discussionList.appendChild(commentItem);
                });
            } else {
                console.error('discussion-list element not found');
            }
        })
        .catch(error => {
            console.error('Error fetching discussion:', error);
            alert('Error fetching discussion. Please try again later.');
        });
    }

    // Navigation event listeners
    loginLink?.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(loginSection);
    });

    registerLink?.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(registerSection);
    });

    coursesLink?.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(coursesSection);
        fetchCourses();
    });

    discussionLink?.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(discussionSection);
        fetchDiscussion();
    });

    booksLink?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'books.html';
    });

    logoutLink?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        updateUIForLoginStatus();
        showSection(loginSection);
        alert('You have been logged out.');
    });

    // Login form submission
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', `Bearer ${data.token}`);
                alert('Login successful!');
                onSuccessfulLogin(); // Call this function after login
            } else {
                const errorData = await response.json();
                document.getElementById('login-error').textContent = errorData.message;
            }
        } catch (error) {
            console.error('Login error:', error);
            document.getElementById('login-error').textContent = 'An error occurred. Please try again.';
        }
    });

    // Registration form submission
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (response.ok) {
                alert('Registration successful!');
                showSection(loginSection);
            } else {
                const errorData = await response.json();
                document.getElementById('register-error').textContent = errorData.message;
            }
        } catch (error) {
            console.error('Registration error:', error);
            document.getElementById('register-error').textContent = 'An error occurred. Please try again.';
        }
    });

    // Discussion form submission
    discussionForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const comment = document.getElementById('discussion-comment').value;
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to post a comment.');
            showSection(loginSection);
            return;
        }
        try {
            const response = await fetch('/api/discussion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({ comment }),
            });

            if (response.ok) {
                alert('Comment posted successfully!');
                document.getElementById('discussion-comment').value = '';
                fetchDiscussion();
            } else {
                throw new Error('Error posting comment.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error posting comment. Please try again.');
        }
    });

    // Initial UI update
    updateUIForLoginStatus();
});

