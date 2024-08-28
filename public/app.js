export function fetchCourses() {
    const token = localStorage.getItem('token');
    fetch('/api/courses', {
        headers: { 'Authorization': token }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
    })
    .then(data => {
        const coursesContainer = document.getElementById('courses-list');
        coursesContainer.innerHTML = '';
        data.forEach(course => {
            const courseItem = document.createElement('li');
            courseItem.innerHTML = `<h3>${course.name}</h3><p>${course.description || 'No description available.'}</p>`;
            coursesContainer.appendChild(courseItem);
        });
    })
    .catch(error => console.error('Error:', error));
}



