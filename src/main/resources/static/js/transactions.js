const role = sessionStorage.getItem('userRole');
const uid = sessionStorage.getItem('userId');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => '₹' + Number(value || 0).toLocaleString('en-IN',{maximumFractionDigits:2});
const date = value => value ? new Date(value).toLocaleString('en-IN') : '—';
async function request(url, options) { const r=await fetch(url,options); if(!r.ok){let b={};try{b=await r.json()}catch{}throw new Error(b.message||`Request failed (${r.status})`)} return r.status===204?null:r.json(); }
document.addEventListener('DOMContentLoaded', async () => {
 if(!uid||!['CLIENT','FREELANCER'].includes(role)) return location.assign('/login');
 document.getElementById('dashboardLink').href=role==='CLIENT'?'/client-dashboard':'/freelancer-dashboard';
 document.getElementById('profileName').textContent=sessionStorage.getItem('userName')||role;
 document.getElementById('profileRole').textContent=role;
 document.getElementById('avatar').textContent=(sessionStorage.getItem('userName')||role)[0].toUpperCase();
 document.getElementById('logoutButton').onclick=async()=>{await fetch('/api/auth/logout',{method:'POST'});sessionStorage.clear();location.assign('/login')};
 try {
   const [allReleases, allTransactions]=await Promise.all([request('/api/escrow'),request('/api/transactions')]);
   const owns = r => {const p=r.escrowRelease?.milestone?.project;return role==='CLIENT'?String(p?.client?.id)===String(uid):String(p?.freelancer?.id)===String(uid)};
   const releases=allReleases.filter(r=>{const p=r.milestone?.project;return role==='CLIENT'?String(p?.client?.id)===String(uid):String(p?.freelancer?.id)===String(uid)});
   const transactions=allTransactions.filter(owns);
   const txIds=new Set(transactions.map(t=>String(t.escrowRelease?.id)));
   document.getElementById('releaseList').innerHTML=releases.length?releases.map(r=>`<article class="project-item"><div><strong>${esc(r.milestone?.title||'Milestone')} · ${money(r.amount)}</strong><span>${esc(r.status)} · Released ${date(r.releasedAt)}</span></div>${role==='CLIENT'&&!txIds.has(String(r.id))?`<button class="primary-button" data-create="${r.id}">Create transaction</button>`:''}</article>`).join(''):'<div class="empty">No released escrow for your projects.</div>';
   document.getElementById('transactionList').innerHTML=transactions.length?transactions.map(t=>`<article class="project-item"><div><strong>${esc(t.escrowRelease?.milestone?.title||'Milestone')} · ${money(t.amount)}</strong><span>${date(t.transactionDate)}</span></div><span class="project-status">${esc(t.status)}</span></article>`).join(''):'<div class="empty">No transactions yet.</div>';
   document.querySelectorAll('[data-create]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await request(`/api/transactions/escrow/${b.dataset.create}`,{method:'POST'});location.reload()}catch(e){alert(e.message);b.disabled=false}});
 } catch(e) { document.getElementById('releaseList').textContent=e.message; document.getElementById('transactionList').textContent=e.message; }
});
