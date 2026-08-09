// ============================================
// EXAMPLE CODE — paste relevant parts into your frontend's js/script.js
// Change http://localhost:5000 to your deployed backend URL once hosted
// ============================================

const API_BASE = "http://localhost:5000/api";

// ---------- 1. REGISTER PAGE ----------
// In register.html, give your form an id="registerForm"
// with inputs: name="name", name="email", name="password"

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = registerForm.name.value;
    const email = registerForm.email.value;
    const password = registerForm.password.value;

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      // Save token so the user stays logged in
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);

      alert("Registered successfully!");
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Check console.");
    }
  });
}

// ---------- 2. LOGIN PAGE ----------
// In login.html, give your form an id="loginForm"
// with inputs: name="email", name="password"

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);

      alert("Logged in successfully!");
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Check console.");
    }
  });
}

// ---------- 3. CREATE BLOG PAGE ----------
// In create-blog.html, give your form an id="createBlogForm"
// with inputs: name="title", name="content"

const createBlogForm = document.getElementById("createBlogForm");
if (createBlogForm) {
  createBlogForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = createBlogForm.title.value;
    const content = createBlogForm.content.value;
    const token = localStorage.getItem("token"); // must be logged in

    if (!token) {
      alert("Please log in first");
      window.location.href = "login.html";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // sends the login token
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create blog");
        return;
      }

      alert("Blog created successfully!");
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Check console.");
    }
  });
}

// ---------- 4. DASHBOARD / HOME PAGE — show all blogs ----------
// In dashboard.html or index.html, add an empty container:
// <div id="blogList"></div>

const blogList = document.getElementById("blogList");
if (blogList) {
  fetch(`${API_BASE}/blogs`)
    .then((res) => res.json())
    .then((blogs) => {
      blogList.innerHTML = blogs
        .map(
          (blog) => `
          <div class="blog-card">
            <h3>${blog.title}</h3>
            <p>${blog.content}</p>
            <small>By ${blog.author?.name || "Unknown"}</small>
          </div>
        `
        )
        .join("");
    })
    .catch((err) => console.error(err));
}
