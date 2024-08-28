document.addEventListener('DOMContentLoaded', () => {
    const addBookForm = document.getElementById('add-book-form');
    const addBookButton = document.getElementById('add-book-button');
    let currentCourseId = 1; // Set a default course ID

    function loadBooks(courseId) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('User not logged in. Cannot load books.');
            return;
        }

        fetch(`/books/${courseId}`, {
            headers: {
                'Authorization': token
            }
        })
        .then(response => response.json())
        .then(data => {
            const bookList = document.getElementById('bookList');
            if (bookList) {
                bookList.innerHTML = '';
                data.forEach(book => {
                    const li = document.createElement('li');
                    li.textContent = `${book.title} by ${book.author} (ISBN: ${book.isbn})`;
                    bookList.appendChild(li);
                });
            } else {
                console.error('bookList element not found');
            }
        })
        .catch(error => {
            console.error('Error loading books:', error);
            const booksError = document.getElementById('books-error');
            if (booksError) {
                booksError.textContent = 'An error occurred while loading books.';
            }
        });
    }

    function addBook() {
        const title = document.getElementById('bookTitle').value;
        const author = document.getElementById('bookAuthor').value;
        const isbn = document.getElementById('bookISBN').value;
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Please log in to add a book.');
            return;
        }

        fetch('/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ course_id: currentCourseId, title, author, isbn })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadBooks(currentCourseId);
        })
        .catch(error => {
            console.error('Error adding book:', error);
            const booksError = document.getElementById('books-error');
            if (booksError) {
                booksError.textContent = 'An error occurred while adding the book.';
            }
        });
    }

    addBookButton?.addEventListener('click', addBook);

    // Initial load of books for the current course
    loadBooks(currentCourseId);
});