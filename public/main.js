import { fetchCourses } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const coursesLink = document.getElementById('courses-link');
    const discussionLink = document.getElementById('discussion-link');
    const booksLink = document.getElementById('books-link');
    const logoutLink = document.getElementById('logout-link');
    const userInfo = document.getElementById('user-info');
    const userNameSpan = document.getElementById('user-name');
    const userEmailSpan = document.getElementById('user-email');

    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const coursesSection = document.getElementById('courses-section');
    const discussionSection = document.getElementById('discussion-section');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const discussionForm = document.getElementById('discussion-form');

    function updateUIForLoginStatus() {
        const token = localStorage.getItem('token');

        if (token) {
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'inline-block';
            if (coursesLink) coursesLink.style.display = 'inline-block';
            if (discussionLink) discussionLink.style.display = 'inline-block';
            if (booksLink) booksLink.style.display = 'inline-block';
            if (userInfo) userInfo.style.display = 'block';

            fetch('/api/user-info', {
                headers: { 'Authorization': token }
            })
            .then(response => response.json())
            .then(userInfo => {
                if (userNameSpan) userNameSpan.textContent = userInfo.name;
                if (userEmailSpan) userEmailSpan.textContent = userInfo.email;
            });

            if (coursesSection) showSection(coursesSection);
            fetchCourses();
        } else {
            if (loginLink) loginLink.style.display = 'inline-block';
            if (registerLink) registerLink.style.display = 'inline-block';
            if (logoutLink) logoutLink.style.display = 'none';
            if (coursesLink) coursesLink.style.display = 'none';
            if (discussionLink) discussionLink.style.display = 'none';
            if (booksLink) booksLink.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
            if (loginSection) showSection(loginSection);
        }
    }

    function onSuccessfulLogin() {
        updateUIForLoginStatus();
        fetchCourses(); 
    }

    function showSection(section) {
        const sections = document.querySelectorAll('main > section');
        sections.forEach((s) => s.style.display = 'none');
        if (section) section.style.display = 'block';
    }

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
            if (!response.ok) throw new Error('Failed to fetch discussion');
            return response.json();
        })
        .then(discussion => {
            const discussionList = document.getElementById('discussion-list');
            if (discussionList) {
                discussionList.innerHTML = '';
                discussion.forEach(comment => {
                    const commentItem = document.createElement('li');
                    const timestamp = new Date(comment.created_at).toLocaleString();
                    commentItem.innerHTML = `
                        ${comment.name}: ${comment.comment} (Posted on: ${timestamp})
                        <button data-id="${comment.id}" class="delete-comment">Delete</button>
                    `;
                    discussionList.appendChild(commentItem);
                });

                document.querySelectorAll('.delete-comment').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const commentId = e.target.getAttribute('data-id');
                        deleteComment(commentId);
                    });
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

    function deleteComment(commentId) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User not logged in. Cannot delete comment.');
            return;
        }

        fetch(`/api/discussion/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': token },
        })
        .then(response => {
            if (response.ok) {
                alert('Comment deleted successfully');
                fetchDiscussion();
            } else {
                response.json().then(data => {
                    alert(data.message || 'Failed to delete comment');
                });
            }
        })
        .catch(error => {
            console.error('Error deleting comment:', error);
            alert('Error deleting comment. Please try again later.');
        });
    }

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
                onSuccessfulLogin();
            } else {
                const errorData = await response.json();
                document.getElementById('login-error').textContent = errorData.message;
            }
        } catch (error) {
            console.error('Login error:', error);
            document.getElementById('login-error').textContent = 'An error occurred. Please try again.';
        }
    });

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

    updateUIForLoginStatus();
});

