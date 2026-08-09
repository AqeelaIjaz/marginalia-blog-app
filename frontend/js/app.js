// ============================================
// CHANGE THIS if your backend runs on a different port/URL
// ============================================
const API_BASE = "http://localhost:5001/api";

// ---------- Helpers ----------
function getToken() {
  return localStorage.getItem("token");
}
function getUserName() {
  return localStorage.getItem("userName");
}
function signOut() {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  window.location.href = "index.html";
}
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function showMessage(el, text, type) {
  el.textContent = text;
  el.className = `form-message show ${type}`;
}
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Password strength check — mirrors the backend rule:
// at least 8 characters, one number, one special character
function checkPasswordStrength(password) {
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]/;']/.test(password);
  const hasLength = password.length >= 8;

  const score = [hasLength, hasNumber, hasSpecial].filter(Boolean).length;
  return {
    valid: hasLength && hasNumber && hasSpecial,
    score, // 0–3
  };
}

function wirePasswordStrengthMeter(inputEl, barEl, hintEl) {
  if (!inputEl || !barEl) return;
  inputEl.addEventListener("input", () => {
    const { score } = checkPasswordStrength(inputEl.value);
    const widths = ["6%", "35%", "68%", "100%"];
    const colors = ["#ff8577", "#ff8577", "#f2a93b", "#4fd8b8"];
    barEl.style.width = widths[score];
    barEl.style.background = colors[score];
    if (hintEl) {
      hintEl.textContent =
        score < 3
          ? "Use 8+ characters, with at least one number and one special character (e.g. ! @ # $)"
          : "Strong password";
    }
  });
}

// ---------- Navbar (sign in state) ----------
function renderNavUser() {
  const navUserEl = document.getElementById("navUser");
  if (!navUserEl) return;

  const name = getUserName();
  if (name) {
    navUserEl.innerHTML = `<a href="profile.html">Hi, ${escapeHtml(name)}</a> · <a href="#" id="signOutLink">Sign out</a>`;
    document.getElementById("signOutLink").addEventListener("click", (e) => {
      e.preventDefault();
      signOut();
    });
  } else {
    navUserEl.innerHTML = `<a href="login.html">Sign in</a>`;
  }
}
document.addEventListener("DOMContentLoaded", renderNavUser);

// ============================================
// SIGN UP PAGE (register.html)
// ============================================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  wirePasswordStrengthMeter(
    document.getElementById("password"),
    document.getElementById("pwStrengthBar"),
    document.getElementById("pwHint")
  );

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("formMessage");
    const submitBtn = registerForm.querySelector("button[type=submit]");

    const name = registerForm.name.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;

    if (!checkPasswordStrength(password).valid) {
      showMessage(msgEl, "Password must be 8+ characters with a number and a special character", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showMessage(msgEl, data.message || "Sign up failed", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign up";
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      showMessage(msgEl, "Account created. Redirecting...", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 700);
    } catch (err) {
      showMessage(msgEl, "Could not reach the server. Is the backend running?", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign up";
    }
  });
}

// ============================================
// SIGN IN PAGE (login.html)
// ============================================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("formMessage");
    const submitBtn = loginForm.querySelector("button[type=submit]");

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showMessage(msgEl, data.message || "Sign in failed", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign in";
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      showMessage(msgEl, "Signed in. Redirecting...", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 700);
    } catch (err) {
      showMessage(msgEl, "Could not reach the server. Is the backend running?", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign in";
    }
  });
}

// ============================================
// FORGOT PASSWORD PAGE (forgot-password.html)
// ============================================
const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("formMessage");
    const submitBtn = forgotForm.querySelector("button[type=submit]");
    const email = forgotForm.email.value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending link...";

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      showMessage(
        msgEl,
        data.message || "If that email is registered, a reset link has been sent",
        "success"
      );
      submitBtn.disabled = false;
      submitBtn.textContent = "Send reset link";
    } catch (err) {
      showMessage(msgEl, "Could not reach the server. Is the backend running?", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Send reset link";
    }
  });
}

// ============================================
// RESET PASSWORD PAGE (reset-password.html)
// ============================================
const resetForm = document.getElementById("resetForm");
if (resetForm) {
  wirePasswordStrengthMeter(
    document.getElementById("newPassword"),
    document.getElementById("pwStrengthBar"),
    document.getElementById("pwHint")
  );

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const noTokenNotice = document.getElementById("noTokenNotice");

  if (!token && noTokenNotice) {
    noTokenNotice.classList.add("show");
    resetForm.style.display = "none";
  }

  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("formMessage");
    const submitBtn = resetForm.querySelector("button[type=submit]");

    const newPassword = resetForm.newPassword.value;
    const confirmPassword = resetForm.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      showMessage(msgEl, "Passwords do not match", "error");
      return;
    }
    if (!checkPasswordStrength(newPassword).valid) {
      showMessage(msgEl, "Password must be 8+ characters with a number and a special character", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Updating...";

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        showMessage(msgEl, data.message || "Could not reset password", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Update password";
        return;
      }

      showMessage(msgEl, "Password updated. Redirecting to sign in...", "success");
      setTimeout(() => (window.location.href = "login.html"), 1200);
    } catch (err) {
      showMessage(msgEl, "Could not reach the server. Is the backend running?", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Update password";
    }
  });
}

// ============================================
// CREATE BLOG PAGE
// ============================================
const createBlogForm = document.getElementById("createBlogForm");
if (createBlogForm) {
  if (!getToken()) window.location.href = "login.html";

  createBlogForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("formMessage");
    const submitBtn = createBlogForm.querySelector("button[type=submit]");

    const title = createBlogForm.title.value.trim();
    const content = createBlogForm.content.value.trim();
    const category = createBlogForm.category ? createBlogForm.category.value : "General";

    submitBtn.disabled = true;
    submitBtn.textContent = "Publishing...";

    try {
      const res = await fetch(`${API_BASE}/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ title, content, category }),
      });
      const data = await res.json();

      if (!res.ok) {
        showMessage(msgEl, data.message || "Could not publish", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Publish post";
        return;
      }

      showMessage(msgEl, "Published. Redirecting to your dashboard...", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 700);
    } catch (err) {
      showMessage(msgEl, "Could not reach the server. Is the backend running?", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Publish post";
    }
  });
}

// ============================================
// HOME PAGE — public feed, with search + category filter
// ============================================
const homeFeed = document.getElementById("homeFeed");
if (homeFeed) {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  loadFeed(homeFeed, { search: "", category: "All" });

  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadFeed(homeFeed, {
          search: searchInput.value.trim(),
          category: categoryFilter ? categoryFilter.value : "All",
        });
      }, 350); // debounce so it doesn't fetch on every keystroke
    });
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => {
      loadFeed(homeFeed, {
        search: searchInput ? searchInput.value.trim() : "",
        category: categoryFilter.value,
      });
    });
  }
}

// ============================================
// DASHBOARD PAGE — logged-in user's blogs + edit/delete + delete account
// ============================================
const dashFeed = document.getElementById("dashFeed");
if (dashFeed) {
  if (!getToken()) {
    window.location.href = "login.html";
  } else {
    const welcomeName = document.getElementById("welcomeName");
    if (welcomeName) welcomeName.textContent = getUserName() || "there";
    loadFeed(dashFeed, { useMine: true, showActions: true });
  }
}

// Delete account modal wiring (only present on dashboard.html)
const deleteBtn = document.getElementById("deleteAccountBtn");
const modalOverlay = document.getElementById("deleteModal");
if (deleteBtn && modalOverlay) {
  const cancelBtn = document.getElementById("cancelDeleteBtn");
  const confirmBtn = document.getElementById("confirmDeleteBtn");

  deleteBtn.addEventListener("click", () => modalOverlay.classList.add("show"));
  cancelBtn.addEventListener("click", () => modalOverlay.classList.remove("show"));

  confirmBtn.addEventListener("click", async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Deleting...";
    try {
      const res = await fetch(`${API_BASE}/auth/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Could not delete account");
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Yes, delete my account";
        return;
      }
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      window.location.href = "index.html";
    } catch (err) {
      alert("Could not reach the server.");
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Yes, delete my account";
    }
  });
}

// ============================================
// PROFILE PAGE (profile.html)
// ============================================
const profileDetails = document.getElementById("profileDetails");
if (profileDetails) {
  if (!getToken()) {
    window.location.href = "login.html";
  } else {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const user = await res.json();

        if (!res.ok) {
          profileDetails.innerHTML = `<p>Could not load your profile.</p>`;
          return;
        }

        const joined = new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        profileDetails.innerHTML = `
          <div class="field">
            <label>Name</label>
            <div style="padding:12px 14px; border:1.5px solid var(--border-light); border-radius:6px; background:var(--bg-alt);">${escapeHtml(user.name)}</div>
          </div>
          <div class="field">
            <label>Email</label>
            <div style="padding:12px 14px; border:1.5px solid var(--border-light); border-radius:6px; background:var(--bg-alt);">${escapeHtml(user.email)}</div>
          </div>
          <div class="field-hint" style="margin-top:-8px;">Member since ${joined}</div>
        `;
      } catch (err) {
        profileDetails.innerHTML = `<p>Could not reach the server. Is the backend running?</p>`;
      }
    })();
  }
}

// ============================================
// EDIT BLOG PAGE (edit-blog.html)
// ============================================
const editBlogForm = document.getElementById("editBlogForm");
if (editBlogForm) {
  if (!getToken()) window.location.href = "login.html";

  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");
  const msgEl = document.getElementById("formMessage");

  if (!editId) {
    showMessage(msgEl, "No post was specified to edit.", "error");
  } else {
    // Pre-fill the form with the existing post's data
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/blogs/${editId}`);
        const blog = await res.json();
        if (!res.ok) {
          showMessage(msgEl, blog.message || "Could not load this post", "error");
          editBlogForm.style.display = "none";
          return;
        }
        editBlogForm.title.value = blog.title;
        editBlogForm.content.value = blog.content;
        if (editBlogForm.category) editBlogForm.category.value = blog.category || "General";
      } catch (err) {
        showMessage(msgEl, "Could not reach the server.", "error");
        editBlogForm.style.display = "none";
      }
    })();
  }

  editBlogForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = editBlogForm.querySelector("button[type=submit]");

    const title = editBlogForm.title.value.trim();
    const content = editBlogForm.content.value.trim();
    const category = editBlogForm.category ? editBlogForm.category.value : "General";

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      const res = await fetch(`${API_BASE}/blogs/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ title, content, category }),
      });
      const data = await res.json();

      if (!res.ok) {
        showMessage(msgEl, data.message || "Could not save changes", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Save changes";
        return;
      }

      showMessage(msgEl, "Saved. Redirecting to your dashboard...", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 700);
    } catch (err) {
      showMessage(msgEl, "Could not reach the server. Is the backend running?", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Save changes";
    }
  });
}

// ============================================
// SINGLE POST PAGE (blog-post.html)
// ============================================
const postContent = document.getElementById("postContent");
if (postContent) {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  loadSinglePost(postContent, postId);
}

async function loadSinglePost(containerEl, id) {
  if (!id) {
    containerEl.innerHTML = `<div class="post-not-found"><p>No post was specified.</p><a href="index.html" class="btn btn-primary">Back to Home</a></div>`;
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/blogs/${id}`);
    if (!res.ok) {
      containerEl.innerHTML = `<div class="post-not-found"><p>This post could not be found. It may have been removed.</p><a href="index.html" class="btn btn-primary">Back to Home</a></div>`;
      return;
    }
    const blog = await res.json();
    const isOwner = getUserName() && blog.author?.name === getUserName();

    containerEl.innerHTML = `
      <div class="post-detail-header">
        <span class="category-badge">${escapeHtml(blog.category || "General")}</span>
        <div class="post-detail-eyebrow">${formatDate(blog.createdAt)} · by ${escapeHtml(blog.author?.name || "Unknown")}</div>
        <h1>${escapeHtml(blog.title)}</h1>
      </div>
      <div class="post-detail-body">${escapeHtml(blog.content)}</div>
      ${
        isOwner
          ? `<div class="post-actions">
              <a href="edit-blog.html?id=${blog._id}" class="btn btn-secondary btn-sm">Edit post</a>
              <button class="btn btn-danger btn-sm" id="deleteThisPostBtn" data-id="${blog._id}">Delete post</button>
            </div>`
          : ""
      }
    `;

    const deleteThisPostBtn = document.getElementById("deleteThisPostBtn");
    if (deleteThisPostBtn) {
      deleteThisPostBtn.addEventListener("click", async () => {
        if (!confirm("Delete this post? This cannot be undone.")) return;
        deleteThisPostBtn.disabled = true;
        deleteThisPostBtn.textContent = "Deleting...";
        try {
          const delRes = await fetch(`${API_BASE}/blogs/${blog._id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          if (!delRes.ok) {
            const delData = await delRes.json();
            alert(delData.message || "Could not delete post");
            deleteThisPostBtn.disabled = false;
            deleteThisPostBtn.textContent = "Delete post";
            return;
          }
          window.location.href = "dashboard.html";
        } catch (err) {
          alert("Could not reach the server.");
          deleteThisPostBtn.disabled = false;
          deleteThisPostBtn.textContent = "Delete post";
        }
      });
    }
  } catch (err) {
    containerEl.innerHTML = `<div class="post-not-found"><p>Could not load this post. Is the backend server running on ${API_BASE}?</p></div>`;
  }
}

// ---------- Shared feed loader ----------
async function loadFeed(containerEl, options = {}) {
  const { filterByAuthorName, showActions, search, category, useMine } = options;

  containerEl.innerHTML = `<p class="feed-count">Loading posts...</p>`;
  try {
    let blogs;

    if (useMine) {
      // Secure path: ask the backend for only this authenticated user's posts,
      // filtered server-side by their actual user ID (not by matching their name)
      const res = await fetch(`${API_BASE}/blogs/mine`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      blogs = await res.json();
    } else {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (category && category !== "All") queryParams.set("category", category);
      const res = await fetch(`${API_BASE}/blogs?${queryParams.toString()}`);
      blogs = await res.json();

      if (filterByAuthorName) {
        blogs = blogs.filter((b) => b.author && b.author.name === filterByAuthorName);
      }
    }

    if (!blogs.length) {
      containerEl.innerHTML = `
        <div class="empty-state">
          <p>${useMine || filterByAuthorName ? "You haven't published anything yet." : "No posts match. Try a different search or category."}</p>
          <a href="create-blog.html" class="btn btn-primary">Write a post</a>
        </div>`;
      return;
    }

    containerEl.innerHTML = blogs
      .map((blog) => {
        const cardInner = `
          <span class="bookmark-tab">${formatDate(blog.createdAt)}</span>
          <span class="category-badge">${escapeHtml(blog.category || "General")}</span>
          <h3>${escapeHtml(blog.title)}</h3>
          <p class="excerpt">${escapeHtml(blog.content).slice(0, 180)}${blog.content.length > 180 ? "…" : ""}</p>
          <div class="byline">by ${escapeHtml(blog.author?.name || "Unknown")}</div>
          ${
            showActions
              ? `<div class="post-actions">
                  <a href="edit-blog.html?id=${blog._id}" class="btn btn-secondary btn-sm">Edit</a>
                  <button class="btn btn-danger btn-sm delete-post-btn" data-id="${blog._id}">Delete</button>
                </div>`
              : ""
          }
        `;

        return showActions
          ? `<article class="blog-card">${cardInner}</article>`
          : `<a href="blog-post.html?id=${blog._id}" style="text-decoration:none; color:inherit;"><article class="blog-card">${cardInner}</article></a>`;
      })
      .join("");

    // Wire up delete buttons (only present when showActions is true)
    containerEl.querySelectorAll(".delete-post-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        if (!confirm("Delete this post? This cannot be undone.")) return;

        btn.disabled = true;
        btn.textContent = "Deleting...";
        try {
          const res = await fetch(`${API_BASE}/blogs/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          if (!res.ok) {
            const data = await res.json();
            alert(data.message || "Could not delete post");
            btn.disabled = false;
            btn.textContent = "Delete";
            return;
          }
          loadFeed(containerEl, options); // refresh the list
        } catch (err) {
          alert("Could not reach the server.");
          btn.disabled = false;
          btn.textContent = "Delete";
        }
      });
    });
  } catch (err) {
    containerEl.innerHTML = `<div class="empty-state"><p>Could not load posts. Is the backend server running on ${API_BASE}?</p></div>`;
  }
}
