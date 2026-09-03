// ============ ADMIN API CONFIG ============
const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('admin-token');

// ============ CHECK AUTH ============
async function checkAuth() {
    if (!token) {
        const password = prompt('Enter admin password:');
        if (password) {
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'admin@gmail.com',
                        password: password
                    })
                });
                const data = await response.json();
                if (data.success) {
                    token = data.token;
                    localStorage.setItem('admin-token', token);
                } else {
                    alert('Invalid password!');
                    window.location.href = 'index.html';
                }
            } catch (error) {
                alert('Login failed!');
                window.location.href = 'index.html';
            }
        } else {
            window.location.href = 'index.html';
        }
    }
}

// ============ API HELPER ============
async function apiFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers }
    });

    if (response.status === 401) {
        localStorage.removeItem('admin-token');
        token = null;
        alert('Session expired. Please login again.');
        window.location.href = 'index.html';
        return null;
    }

    return response;
}

// ============ TABS ============
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(`tab-${this.dataset.tab}`).classList.add('active');
        });
    });
}

// ============ LOAD PROJECTS ============
async function loadAdminProjects() {
    const grid = document.getElementById('admin-project-grid');
    try {
        const response = await apiFetch('/projects');
        if (!response) return;
        const projects = await response.json();
        renderAdminProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        grid.innerHTML = '<p>Failed to load projects.</p>';
    }
}

function renderAdminProjects(projects) {
    const grid = document.getElementById('admin-project-grid');
    if (!projects || projects.length === 0) {
        grid.innerHTML = '<p>No projects yet.</p>';
        return;
    }

    grid.innerHTML = projects.map(project => `
        <div class="admin-card">
            <h3>${project.title}</h3>
            <p>${project.description || ''}</p>
            <p><strong>Technologies:</strong> ${(project.technologies || []).join(', ')}</p>
            <div class="admin-card-actions">
                <button class="btn-edit" data-id="${project._id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-delete" data-id="${project._id}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');

    // Edit handlers
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editProject(btn.dataset.id));
    });

    // Delete handlers
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteProject(btn.dataset.id));
    });
}

// ============ LOAD BLOGS ============
async function loadAdminBlogs() {
    const grid = document.getElementById('admin-blog-grid');
    try {
        const response = await apiFetch('/blog');
        if (!response) return;
        const blogs = await response.json();
        renderAdminBlogs(blogs);
    } catch (error) {
        console.error('Error loading blogs:', error);
        grid.innerHTML = '<p>Failed to load blogs.</p>';
    }
}

function renderAdminBlogs(blogs) {
    const grid = document.getElementById('admin-blog-grid');
    if (!blogs || blogs.length === 0) {
        grid.innerHTML = '<p>No blogs yet.</p>';
        return;
    }

    grid.innerHTML = blogs.map(blog => `
        <div class="admin-card">
            <h3>${blog.title}</h3>
            <p>${blog.excerpt || blog.content.substring(0, 80) + '...'}</p>
            <p><strong>Category:</strong> ${blog.category}</p>
            <div class="admin-card-actions">
                <button class="btn-edit" data-id="${blog._id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-delete" data-id="${blog._id}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editBlog(btn.dataset.id));
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteBlog(btn.dataset.id));
    });
}

// ============ LOAD MESSAGES ============
async function loadAdminMessages() {
    const grid = document.getElementById('admin-messages-grid');
    try {
        const response = await apiFetch('/contact');
        if (!response) return;
        const messages = await response.json();
        renderAdminMessages(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
        grid.innerHTML = '<p>Failed to load messages.</p>';
    }
}

function renderAdminMessages(messages) {
    const grid = document.getElementById('admin-messages-grid');
    if (!messages || messages.length === 0) {
        grid.innerHTML = '<p>No messages yet.</p>';
        return;
    }

    grid.innerHTML = messages.map(msg => `
        <div class="admin-card">
            <h3>${msg.name}</h3>
            <p><strong>Email:</strong> ${msg.email}</p>
            <p><strong>Subject:</strong> ${msg.subject || 'No subject'}</p>
            <p>${msg.message}</p>
            <p><small>${new Date(msg.createdAt).toLocaleString()}</small></p>
            <p><strong>Status:</strong> ${msg.read ? '✅ Read' : '📩 Unread'}</p>
            <div class="admin-card-actions">
                ${!msg.read ? `<button class="btn-edit" data-id="${msg._id}"><i class="fas fa-check"></i> Mark Read</button>` : ''}
                <button class="btn-delete" data-id="${msg._id}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => markRead(btn.dataset.id));
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteMessage(btn.dataset.id));
    });
}

// ============ CRUD OPERATIONS ============
async function createProject(data) {
    const response = await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    if (response && response.ok) {
        alert('Project created successfully!');
        loadAdminProjects();
        return true;
    }
    alert('Failed to create project.');
    return false;
}

async function updateProject(id, data) {
    const response = await apiFetch(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    if (response && response.ok) {
        alert('Project updated successfully!');
        loadAdminProjects();
        return true;
    }
    alert('Failed to update project.');
    return false;
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const response = await apiFetch(`/projects/${id}`, { method: 'DELETE' });
    if (response && response.ok) {
        alert('Project deleted successfully!');
        loadAdminProjects();
    } else {
        alert('Failed to delete project.');
    }
}

async function createBlog(data) {
    const response = await apiFetch('/blog', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    if (response && response.ok) {
        alert('Blog created successfully!');
        loadAdminBlogs();
        return true;
    }
    alert('Failed to create blog.');
    return false;
}

async function updateBlog(id, data) {
    const response = await apiFetch(`/blog/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    if (response && response.ok) {
        alert('Blog updated successfully!');
        loadAdminBlogs();
        return true;
    }
    alert('Failed to update blog.');
    return false;
}

async function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    const response = await apiFetch(`/blog/${id}`, { method: 'DELETE' });
    if (response && response.ok) {
        alert('Blog deleted successfully!');
        loadAdminBlogs();
    } else {
        alert('Failed to delete blog.');
    }
}

async function markRead(id) {
    const response = await apiFetch(`/contact/${id}/read`, { method: 'PUT' });
    if (response && response.ok) {
        loadAdminMessages();
    }
}

async function deleteMessage(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    const response = await apiFetch(`/contact/${id}`, { method: 'DELETE' });
    if (response && response.ok) {
        alert('Message deleted successfully!');
        loadAdminMessages();
    } else {
        alert('Failed to delete message.');
    }
}

// ============ MODAL ============
function openModal(title, data = null) {
    const modal = document.getElementById('modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('edit-id').value = data?._id || '';

    if (data) {
        document.getElementById('form-title').value = data.title || '';
        document.getElementById('form-description').value = data.description || '';
        document.getElementById('form-technologies').value = (data.technologies || []).join(', ');
        document.getElementById('form-category').value = data.category || 'web';
        document.getElementById('form-liveLink').value = data.liveLink || '';
        document.getElementById('form-githubLink').value = data.githubLink || '';
    } else {
        document.getElementById('admin-form').reset();
    }

    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

// ============ FORM HANDLING ============
function initForm() {
    const form = document.getElementById('admin-form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const id = document.getElementById('edit-id').value;
        const data = {
            title: document.getElementById('form-title').value.trim(),
            description: document.getElementById('form-description').value.trim(),
            technologies: document.getElementById('form-technologies').value.split(',').map(t => t.trim()).filter(t => t),
            category: document.getElementById('form-category').value,
            liveLink: document.getElementById('form-liveLink').value.trim(),
            githubLink: document.getElementById('form-githubLink').value.trim()
        };

        let success;
        if (id) {
            success = await updateProject(id, data);
        } else {
            success = await createProject(data);
        }

        if (success) {
            closeModal();
        }
    });
}

// ============ INITIALIZE ============
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    await checkAuth();

    // Initialize features
    initTabs();
    initForm();

    // Load data
    loadAdminProjects();
    loadAdminBlogs();
    loadAdminMessages();

    // Modal close handlers
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.querySelector('.modal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    // Add project button
    document.getElementById('add-project-btn').addEventListener('click', () => {
        openModal('Add New Project');
    });

    // Add blog button
    document.getElementById('add-blog-btn').addEventListener('click', () => {
        openBlogModal();
    });
});

// ============ BLOG MODAL ============
function openBlogModal(data = null) {
    const modal = document.getElementById('modal');
    document.getElementById('modal-title').textContent = data ? 'Edit Blog' : 'Add New Blog';
    document.getElementById('edit-id').value = data?._id || '';

    // Change form fields for blog
    const form = document.getElementById('admin-form');
    form.innerHTML = `
        <input type="hidden" id="edit-id" value="${data?._id || ''}" />
        <input type="text" id="form-title" placeholder="Blog Title" required value="${data?.title || ''}" />
        <textarea id="form-content" placeholder="Blog Content" required>${data?.content || ''}</textarea>
        <input type="text" id="form-excerpt" placeholder="Excerpt (Short summary)" value="${data?.excerpt || ''}" />
        <input type="text" id="form-category" placeholder="Category" required value="${data?.category || ''}" />
        <input type="text" id="form-tags" placeholder="Tags (comma separated)" value="${(data?.tags || []).join(', ')}" />
        <button type="submit" class="btn btn-primary">Save</button>
    `;

    // Handle blog form submission
    form.onsubmit = async function(e) {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const data = {
            title: document.getElementById('form-title').value.trim(),
            content: document.getElementById('form-content').value.trim(),
            excerpt: document.getElementById('form-excerpt').value.trim() || document.getElementById('form-content').value.substring(0, 150) + '...',
            category: document.getElementById('form-category').value.trim(),
            tags: document.getElementById('form-tags').value.split(',').map(t => t.trim()).filter(t => t)
        };

        let success;
        if (id) {
            success = await updateBlog(id, data);
        } else {
            success = await createBlog(data);
        }

        if (success) {
            closeModal();
            // Reset form for next use
            form.innerHTML = originalFormHTML;
            form.onsubmit = originalSubmitHandler;
        }
    };

    const originalFormHTML = form.innerHTML;
    const originalSubmitHandler = form.onsubmit;

    modal.classList.add('show');
}

// Store original form for later use
const originalFormHTML = document.getElementById('admin-form').innerHTML;
const originalSubmitHandler = document.getElementById('admin-form').onsubmit;