<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Модерация отзывов — Альмари Гурзуф</title>
    <meta name="robots" content="noindex, nofollow">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',sans-serif;background:#f0f4f8;color:#1a2a3a;min-height:100vh}

        /* Login */
        .login-screen{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;background:linear-gradient(135deg,#f0f4f8,#e8f4fd)}
        .login-card{background:#fff;border-radius:28px;padding:48px 44px;width:100%;max-width:400px;box-shadow:0 30px 80px rgba(0,48,80,.12);text-align:center}
        .login-logo{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:28px;font-family:'Montserrat',sans-serif;font-weight:800;font-size:18px}
        .logo-icon{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#0093E9,#80D0C7);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;box-shadow:0 8px 20px rgba(0,147,233,.3)}
        .login-card h1{font-family:'Montserrat',sans-serif;font-size:22px;font-weight:800;margin-bottom:28px}
        .field{margin-bottom:16px;text-align:left}
        .field label{display:block;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#4a5568;margin-bottom:6px}
        .field input{width:100%;padding:12px 16px;border:1.5px solid #e8edf5;border-radius:12px;font-family:'Inter',sans-serif;font-size:15px;color:#1a2a3a;background:#fafbfd;transition:.2s}
        .field input:focus{outline:none;border-color:#0093E9;box-shadow:0 0 0 4px rgba(0,147,233,.08);background:#fff}
        .error{color:#e53e3e;font-size:13px;margin-bottom:12px;min-height:18px;text-align:left}
        .btn-primary{width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,#0093E9,#80D0C7);color:#fff;font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:.2s;box-shadow:0 8px 20px rgba(0,147,233,.25);margin-top:8px}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(0,147,233,.35)}
        .btn-primary:disabled{opacity:.6;cursor:not-allowed}

        /* Dashboard */
        #dashboard{display:none}
        .adm-header{background:#fff;border-bottom:1px solid #edf2f7;position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(0,0,0,.04)}
        .adm-header-inner{max-width:1100px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between}
        .adm-header-left{display:flex;align-items:center;gap:10px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:16px}
        .logo-icon.sm{width:36px;height:36px;border-radius:10px;font-size:15px}
        .btn-outline{padding:8px 18px;border-radius:10px;border:1.5px solid #e2e8f0;background:#fff;color:#4a5568;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:.2s}
        .btn-outline:hover{border-color:#0093E9;color:#0093E9}
        .adm-main{max-width:1100px;margin:0 auto;padding:32px 24px 60px}

        /* Stats */
        .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}
        .stat-card{background:#fff;border-radius:18px;padding:20px;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.05);cursor:pointer;transition:.2s;border:2px solid transparent}
        .stat-card:hover,.stat-card.active{border-color:#0093E9}
        .stat-card i{font-size:22px;color:#0093E9;margin-bottom:8px;display:block}
        .stat-num{display:block;font-family:'Montserrat',sans-serif;font-size:28px;font-weight:800;line-height:1}
        .stat-label{display:block;font-size:12px;color:#718096;margin-top:4px;font-weight:600}

        /* Tabs */
        .tabs{display:flex;gap:8px;margin-bottom:24px}
        .tab{padding:10px 22px;border-radius:12px;border:1.5px solid #e2e8f0;background:#fff;color:#4a5568;font-size:14px;font-weight:600;cursor:pointer;transition:.2s}
        .tab.active,.tab:hover{background:#0093E9;border-color:#0093E9;color:#fff}

        /* Cards grid */
        .reviews-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px}
        .empty{grid-column:1/-1;text-align:center;padding:60px 20px;color:#a0aec0;font-size:15px}
        .empty i{font-size:40px;display:block;margin-bottom:12px}
        .loading{grid-column:1/-1;text-align:center;padding:60px;color:#718096}

        /* Review card */
        .rv-card{background:#fff;border-radius:20px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,.06);display:flex;flex-direction:column;gap:14px}
        .rv-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
        .rv-name{font-weight:700;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .rv-meta{font-size:12px;color:#718096;margin-top:2px}
        .rv-stars{color:#ffcc00;font-size:15px;white-space:nowrap;flex-shrink:0}
        .rv-text{font-size:14px;line-height:1.65;color:#4a5568;font-style:italic}
        .rv-photos{display:flex;gap:8px;flex-wrap:wrap}
        .rv-photo{width:68px;height:68px;border-radius:10px;object-fit:cover;cursor:pointer;transition:.2s}
        .rv-photo:hover{transform:scale(1.06)}
        .rv-actions{display:flex;gap:10px;padding-top:4px;border-top:1px solid #f0f4f8}
        .btn-approve,.btn-reject,.btn-delete{flex:1;padding:10px;border-radius:12px;border:none;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:.2s}
        .btn-approve{background:rgba(56,161,105,.1);color:#276749}
        .btn-approve:hover{background:#38a169;color:#fff}
        .btn-reject{background:rgba(229,62,62,.08);color:#c53030}
        .btn-reject:hover{background:#e53e3e;color:#fff}
        .btn-delete{background:rgba(113,128,150,.1);color:#4a5568}
        .btn-delete:hover{background:#718096;color:#fff}

        @media(max-width:600px){
            .stats{gap:10px}.stat-num{font-size:22px}.adm-main{padding:20px 16px 40px}
            .login-card{padding:36px 24px}.reviews-grid{grid-template-columns:1fr}
        }
    </style>
</head>
<body>

<!-- Вход -->
<div id="login" class="login-screen">
    <div class="login-card">
        <div class="login-logo">
            <div class="logo-icon"><i class="fas fa-home"></i></div>
            <span>Альмари Гурзуф</span>
        </div>
        <h1>Модерация отзывов</h1>
        <form id="loginForm">
            <div class="field">
                <label>Пароль</label>
                <input type="password" id="passInput" placeholder="••••••••" required autocomplete="current-password">
            </div>
            <p id="loginError" class="error"></p>
            <button type="submit" class="btn-primary" id="loginBtn">
                <i class="fas fa-sign-in-alt"></i> Войти
            </button>
        </form>
    </div>
</div>

<!-- Дашборд -->
<div id="dashboard">
    <header class="adm-header">
        <div class="adm-header-inner">
            <div class="adm-header-left">
                <div class="logo-icon sm"><i class="fas fa-star"></i></div>
                <span>Панель модерации</span>
            </div>
            <button class="btn-outline" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Выйти</button>
        </div>
    </header>
    <main class="adm-main">
        <div class="stats">
            <div class="stat-card active" data-tab="pending">
                <i class="fas fa-clock"></i>
                <span class="stat-num" id="cnt-pending">0</span>
                <span class="stat-label">Ожидают</span>
            </div>
            <div class="stat-card" data-tab="approved">
                <i class="fas fa-check-circle"></i>
                <span class="stat-num" id="cnt-approved">0</span>
                <span class="stat-label">Опубликовано</span>
            </div>
            <div class="stat-card" data-tab="rejected">
                <i class="fas fa-times-circle"></i>
                <span class="stat-num" id="cnt-rejected">0</span>
                <span class="stat-label">Отклонено</span>
            </div>
        </div>
        <div class="tabs">
            <button class="tab active" data-tab="pending">Ожидают</button>
            <button class="tab" data-tab="approved">Опубликованные</button>
            <button class="tab" data-tab="rejected">Отклонённые</button>
        </div>
        <div id="reviewsGrid" class="reviews-grid">
            <div class="loading"><i class="fas fa-spinner fa-spin"></i> Загружаем…</div>
        </div>
    </main>
</div>

<script>
const API = '../api/admin-api.php';
let currentTab = 'pending';

// --- Проверка сессии ---
fetch(API + '?action=check').then(r => r.json()).then(d => {
    if (d.auth) showDashboard();
});

// --- Вход ---
document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    const err = document.getElementById('loginError');
    err.textContent = '';
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Входим…';

    const fd = new FormData();
    fd.append('action', 'login');
    fd.append('password', document.getElementById('passInput').value);

    const res = await fetch(API, { method: 'POST', body: fd });
    const data = await res.json();
    if (data.ok) {
        showDashboard();
    } else {
        err.textContent = data.error || 'Ошибка';
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
    }
});

// --- Выход ---
document.getElementById('logoutBtn').addEventListener('click', async () => {
    const fd = new FormData(); fd.append('action','logout');
    await fetch(API, { method:'POST', body: fd });
    location.reload();
});

function showDashboard() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadCounts();
    loadTab('pending');
}

// --- Счётчики ---
async function loadCounts() {
    const d = await fetch(API + '?action=counts').then(r => r.json());
    document.getElementById('cnt-pending').textContent  = d.pending  ?? 0;
    document.getElementById('cnt-approved').textContent = d.approved ?? 0;
    document.getElementById('cnt-rejected').textContent = d.rejected ?? 0;
}

// --- Табы ---
document.querySelectorAll('.tab, .stat-card').forEach(el => {
    el.addEventListener('click', () => {
        const tab = el.dataset.tab;
        if (!tab) return;
        currentTab = tab;
        document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        document.querySelectorAll('.stat-card').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        loadTab(tab);
    });
});

// --- Загрузить отзывы ---
async function loadTab(tab) {
    const grid = document.getElementById('reviewsGrid');
    grid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Загружаем…</div>';

    const d = await fetch(`${API}?action=list&status=${tab}`).then(r => r.json());
    grid.innerHTML = '';

    if (!d.reviews?.length) {
        const labels = { pending: 'Нет ожидающих', approved: 'Нет опубликованных', rejected: 'Нет отклонённых' };
        grid.innerHTML = `<div class="empty"><i class="fas fa-inbox"></i>${labels[tab]}</div>`;
        return;
    }
    d.reviews.forEach(rv => grid.appendChild(buildCard(rv, tab)));
}

// --- Карточка ---
function buildCard(rv, tab) {
    const stars = '★'.repeat(rv.rating) + '☆'.repeat(5 - rv.rating);
    const date  = rv.created_at ? new Date(rv.created_at).toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric' }) : '—';
    const photos = (rv.photos || []).map(u => `<img src="${u}" class="rv-photo" onclick="window.open('${u}','_blank')">`).join('');

    let actions = '';
    if (tab === 'pending') {
        actions = `<button class="btn-approve" onclick="doAction('approve',${rv.id})"><i class="fas fa-check"></i> Опубликовать</button>
                   <button class="btn-reject"  onclick="doAction('reject', ${rv.id})"><i class="fas fa-times"></i> Отклонить</button>`;
    } else if (tab === 'approved') {
        actions = `<button class="btn-reject"  onclick="doAction('reject', ${rv.id})"><i class="fas fa-eye-slash"></i> Снять</button>
                   <button class="btn-delete"  onclick="doAction('delete', ${rv.id})"><i class="fas fa-trash"></i> Удалить</button>`;
    } else {
        actions = `<button class="btn-approve" onclick="doAction('approve',${rv.id})"><i class="fas fa-redo"></i> Опубликовать</button>
                   <button class="btn-delete"  onclick="doAction('delete', ${rv.id})"><i class="fas fa-trash"></i> Удалить</button>`;
    }

    const el = document.createElement('div');
    el.className = 'rv-card';
    el.id = 'rv-' + rv.id;
    el.innerHTML = `
        <div class="rv-top">
            <div><div class="rv-name">${esc(rv.name)}</div><div class="rv-meta">${date}${rv.nights ? ' · ' + esc(rv.nights) : ''}</div></div>
            <div class="rv-stars">${stars}</div>
        </div>
        <p class="rv-text">«${esc(rv.text)}»</p>
        ${photos ? `<div class="rv-photos">${photos}</div>` : ''}
        <div class="rv-actions">${actions}</div>
    `;
    return el;
}

// --- Действия ---
async function doAction(action, id) {
    if (action === 'delete' && !confirm('Удалить отзыв безвозвратно?')) return;
    const fd = new FormData();
    fd.append('action', action);
    fd.append('id', id);
    await fetch(API, { method: 'POST', body: fd });
    document.getElementById('rv-' + id)?.remove();
    loadCounts();
    if (!document.querySelector('.rv-card')) loadTab(currentTab);
}

function esc(s) {
    const d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}
</script>
</body>
</html>
