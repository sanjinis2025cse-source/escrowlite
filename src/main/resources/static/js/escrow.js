const role = sessionStorage.getItem('userRole');
const uid = sessionStorage.getItem('userId');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => '₹' + Number(value || 0).toLocaleString('en-IN',{maximumFractionDigits:2});
const date = value => value ? new Date(value).toLocaleString('en-IN') : '—';
const request = async (url, options) => { const response = await fetch(url, options); if (!response.ok) { let body={}; try { body=await response.json(); } catch {} throw new Error(body.message || `Request failed (${response.status})`); } return response.status === 204 ? null : response.json(); };
document.addEventListener('DOMContentLoaded', async () => {
 if (!uid || !['CLIENT','FREELANCER'].includes(role)) return location.assign('/login');
 document.getElementById('dashboardLink').href = role === 'CLIENT' ? '/client-dashboard' : '/freelancer-dashboard';
 document.getElementById('profileName').textContent = sessionStorage.getItem('userName') || role;
 document.getElementById('profileRole').textContent = role;
 document.getElementById('avatar').textContent = (sessionStorage.getItem('userName') || role)[0].toUpperCase();
 document.getElementById('logoutButton').onclick = async () => { await fetch('/api/auth/logout',{method:'POST'}); sessionStorage.clear(); location.assign('/login'); };
 try {
   const projects = await request(`/api/projects/${role === 'CLIENT' ? 'client' : 'freelancer'}/${encodeURIComponent(uid)}`);
   const groups = await Promise.all(projects.map(p => request(`/api/milestones/project/${p.id}`)));
   const milestones = groups.flat();
   document.getElementById('milestoneList').innerHTML = milestones.length ? milestones.map(m => `<article class="project-item"><div><strong>${esc(m.title)}</strong><span>${money(m.amount)} · ${esc(m.status)} · Due ${esc(m.deadline)}</span></div><div>${role === 'CLIENT' ? `<button class="primary-button" data-release="${m.id}">Release escrow</button>` : '<span>Client release</span>'}</div></article>`).join('') : '<div class="empty">No milestones found for your projects.</div>';
   document.querySelectorAll('[data-release]').forEach(button => button.onclick = async () => { button.disabled=true; try { await request(`/api/escrow/release/${button.dataset.release}`,{method:'POST'}); await refreshReleases(); alert('Escrow released. Amount is taken from the milestone.'); } catch(e) { alert(e.message); button.disabled=false; } });
   await refreshReleases();
 } catch(e) { document.getElementById('milestoneList').textContent=e.message; }
});
async function refreshReleases() {
 const list=document.getElementById('releaseList');
 try {
   const releases=await request('/api/escrow');
   const mine=releases.filter(r => { const p=r.milestone?.project; return role==='CLIENT' ? String(p?.client?.id)===String(uid) : String(p?.freelancer?.id)===String(uid); });
   list.innerHTML=mine.length ? mine.map(r=>`<article class="project-item"><div><strong>${esc(r.milestone?.title || 'Milestone')} · ${money(r.amount)}</strong><span>Released ${date(r.releasedAt)}</span></div><span class="project-status">${esc(r.status)}</span></article>`).join('') : '<div class="empty">No escrow releases yet.</div>';
 } catch(e) { list.textContent=e.message; }
}
