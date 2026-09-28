document.addEventListener('DOMContentLoaded', () => {
    const role = sessionStorage.getItem('userRole');
    const userId = sessionStorage.getItem('userId');
    if (role !== 'CLIENT' || !userId) return window.location.assign('/login');

    const name = sessionStorage.getItem('userName') || 'Client';
    const email = sessionStorage.getItem('userEmail') || '';
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileEmail').textContent = email;
    document.getElementById('welcomeName').textContent = name;
    document.getElementById('profileAvatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('logoutButton').addEventListener('click', logout);
    loadDashboard(userId).catch(error => {
        console.error('Client dashboard error:', error);
        document.getElementById('projectsList').innerHTML = '<div class="loading-state">Unable to load dashboard data.</div>';
        document.getElementById('activityList').innerHTML = '<div class="loading-state">Unable to load activity.</div>';
    });
});

async function getJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response.json();
}

async function loadDashboard(userId) {
    const projects = await getJson(`/api/projects/client/${encodeURIComponent(userId)}`);
    const milestoneGroups = await Promise.all(projects.map(project => getJson(`/api/milestones/project/${project.id}`)));
    const milestones = milestoneGroups.flat();
    const submissionGroups = await Promise.all(milestones.map(async milestone => {
        const response = await fetch(`/api/submissions/milestone/${milestone.id}`);
        if (!response.ok) return [];
        return response.json();
    }));
    const submissions = submissionGroups.flat();
    const escrow = await getJson('/api/escrow');
    const ownIds = new Set(projects.map(project => String(project.id)));
    const ownEscrow = escrow.filter(release => ownIds.has(String(release.milestone?.project?.id)));

    document.getElementById('projectCount').textContent = projects.length;
    document.getElementById('milestoneCount').textContent = milestones.length;
    document.getElementById('escrowAmount').textContent = currency(ownEscrow.reduce((sum, item) => sum + Number(item.amount || 0), 0));
    document.getElementById('pendingReviewCount').textContent = submissions.filter(item => item.status === 'SUBMITTED').length;
    renderProjects(projects);
    renderActivity(submissions);
}

function renderProjects(projects) {
    const list = document.getElementById('projectsList');
    list.innerHTML = projects.length ? projects.slice(0, 5).map(project => `
        <article class="dashboard-item"><div><strong>${escapeHtml(project.title)}</strong><p>${escapeHtml(project.description || '')}</p></div><span class="status-badge">${escapeHtml(project.status)}</span></article>
    `).join('') : '<div class="loading-state">No projects yet. Create your first project.</div>';
}

function renderActivity(submissions) {
    const list = document.getElementById('activityList');
    const recent = submissions.slice().sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)).slice(0, 5);
    list.innerHTML = recent.length ? recent.map(item => `
        <div class="activity-item"><span class="activity-dot"></span><div><strong>${escapeHtml(item.milestone?.title || 'Milestone submission')} · ${escapeHtml(item.status)}</strong><span>${escapeHtml(item.submittedAt ? new Date(item.submittedAt).toLocaleString('en-IN') : '')}</span></div></div>
    `).join('') : '<div class="loading-state">No submission activity yet.</div>';
}

async function logout() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); }
    finally { sessionStorage.clear(); window.location.assign('/login'); }
}

function currency(value) { return '₹' + Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character])); }
