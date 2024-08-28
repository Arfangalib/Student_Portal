document.addEventListener("DOMContentLoaded", () => {
    const discussionForm = document.getElementById("discussion-form");
    const courseSelect = document.getElementById("course-select");
    const commentInput = document.getElementById("comment-input");
    const commentsSection = document.getElementById("comments-section");

    async function loadCourses() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/courses", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to load courses");
            const courses = await response.json();
            courseSelect.innerHTML = '<option value="">Select a course</option>';
            courses.forEach(course => {
                const option = document.createElement("option");
                option.value = course.id;
                option.textContent = course.name;
                courseSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error loading courses:", error);
            alert("Error loading courses");
        }
    }

    async function loadDiscussions(courseId) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/discussions?courseId=${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to load discussions");
            const discussions = await response.json();
            commentsSection.innerHTML = "";
            discussions.forEach(discussion => {
                const commentDiv = document.createElement("div");
                commentDiv.textContent = `${discussion.username}: ${discussion.comment}`;
                commentsSection.appendChild(commentDiv);
            });
        } catch (error) {
            console.error("Error loading discussions:", error);
            alert("Error loading discussions");
        }
    }

    discussionForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const courseId = courseSelect.value;
        const comment = commentInput.value;
        if (!courseId || !comment) {
            alert("Course and comment are required");
            return;
        }
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("/api/discussions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ courseId, comment })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }
            commentInput.value = "";
            loadDiscussions(courseId);
        } catch (error) {
            console.error("Error adding discussion:", error);
            alert("Error adding discussion");
        }
    });

    courseSelect.addEventListener("change", (event) => {
        const courseId = event.target.value;
        if (courseId) {
            loadDiscussions(courseId);
        } else {
            commentsSection.innerHTML = "";
        }
    });

    loadCourses();
});