(function () {
  const API = '';
  const CATEGORIES = [
    { value: 'tumu', label: 'Tüm kategoriler' },
    { value: 'yazili', label: 'Yazılı' },
    { value: 'test', label: 'Test' },
    { value: 'yillik_plan', label: 'Yıllık Plan' },
    { value: 'proje', label: 'Proje' },
    { value: 'sunum', label: 'Sunum' },
    { value: 'etkinlik', label: 'Etkinlik' },
    { value: 'diger', label: 'Diğer' }
  ];
  const TYPES = [
    { value: 'tumu', label: 'Tüm türler' },
    { value: 'word', label: 'Word' },
    { value: 'excel', label: 'Excel' },
    { value: 'pdf', label: 'PDF' }
  ];

  let currentUser = null;

  function getEl(id) { return document.getElementById(id); }
  // Theme helpers for dark/light mode with toggle
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('ogretmen_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('ogretmen_theme', 'light');
    }
    updateThemeIcon();
  }

  function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    icon.textContent = isDark ? '☀️' : '🌙';
  }

  function initTheme() {
    const stored = localStorage.getItem('ogretmen_theme');
    if (stored === 'dark') {
      applyTheme('dark');
    } else if (stored === 'light') {
      applyTheme('light');
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      const next = (current === 'dark') ? 'light' : 'dark';
      applyTheme(next);
    });
  }
  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsAll(sel, root = document) { return root.querySelectorAll(sel); }

  function showView(viewId) {
    qsAll('.view').forEach(v => v.classList.add('hidden'));
    const view = getEl('view-' + viewId);
    if (view) view.classList.remove('hidden');
    history.replaceState(null, '', viewId === 'home' ? '/' : '/' + viewId);
  }

  function setNavUser(loggedIn, username) {
    getEl('nav-auth-wrap').classList.toggle('hidden', loggedIn);
    getEl('nav-user-wrap').classList.toggle('hidden', !loggedIn);
    getEl('nav-upload-wrap').classList.toggle('hidden', !loggedIn);
    const nameEl = qs('.user-name', getEl('nav-user-wrap'));
    if (nameEl) nameEl.textContent = loggedIn ? username : '';
  }

  function fetchMe() {
    fetch(API + '/api/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        currentUser = data.user;
        setNavUser(!!currentUser, currentUser ? currentUser.username : '');
      })
      .catch(() => setNavUser(false));
  }

  function renderDocumentCard(doc) {
    const typeLabel = { word: 'Word', excel: 'Excel', pdf: 'PDF' }[doc.file_type] || 'Belge';
    const categoryLabel = CATEGORIES.find(c => c.value === doc.category)?.label || doc.category;
    const size = doc.file_size ? (doc.file_size / 1024).toFixed(1) + ' KB' : '';
    const desc = doc.description || '';
    const downloadUrl = API + '/api/documents/' + doc.id + '/download';
    return `
      <article class="doc-card">
        <div class="doc-card-header">
          <span class="doc-type ${doc.file_type}">${typeLabel}</span>
          <h3 class="doc-title">${escapeHtml(doc.title)}</h3>
        </div>
        <p class="doc-meta">${escapeHtml(categoryLabel)} · ${escapeHtml(doc.username)}${size ? ' · ' + size : ''}</p>
        ${desc ? `<p class="doc-desc">${escapeHtml(desc)}</p>` : ''}
        <div class="doc-actions">
          <a href="${downloadUrl}" class="doc-download" download>İndir</a>
        </div>
      </article>
    `;
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function loadDocuments(params = {}) {
    const q = new URLSearchParams(params).toString();
    return fetch(API + '/api/documents?' + q, { credentials: 'include' })
      .then(r => r.json())
      .then(data => data.documents || []);
  }

  function renderDocumentList(containerId, emptyId, list) {
    const container = getEl(containerId);
    const emptyEl = getEl(emptyId);
    if (!container) return;
    container.innerHTML = list.length ? list.map(renderDocumentCard).join('') : '';
    if (emptyEl) {
      emptyEl.classList.toggle('hidden', list.length > 0);
    }
  }

  function syncDocumentSelects() {
    const typeSelect = getEl('search-type-docs');
    const catSelect = getEl('search-category-docs');
    if (!typeSelect || !catSelect) return;
    typeSelect.innerHTML = TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join('');
    catSelect.innerHTML = CATEGORIES.map(c => `<option value="${c.value}">${c.label}</option>`).join('');
  }

  function doSearch(view) {
    const isHome = view === 'home';
    const typeEl = getEl(isHome ? 'search-type' : 'search-type-docs');
    const catEl = getEl(isHome ? 'search-category' : 'search-category-docs');
    const qEl = getEl(isHome ? 'search-q' : 'search-q-docs');
    const type = typeEl ? typeEl.value : 'tumu';
    const category = catEl ? catEl.value : 'tumu';
    const q = qEl ? qEl.value.trim() : '';
    const params = {};
    if (type !== 'tumu') params.type = type;
    if (category !== 'tumu') params.category = category;
    if (q) params.q = q;
    loadDocuments(params).then(list => {
      if (isHome) {
        renderDocumentList('home-results', 'home-empty', list.slice(0, 8));
      } else {
        renderDocumentList('documents-results', 'documents-empty', list);
      }
    });
  }

  // Routing
  function route() {
    const path = (location.pathname || '/').replace(/^\//, '') || 'home';
    const view = path === '' ? 'home' : path.split('/')[0];
    const allowed = { home: true, documents: true, google: true, giris: true, kayit: true, login: true, register: true, yukle: true, upload: true, belgeler: true };
    const viewId = view === 'belgeler' ? 'documents' : view === 'giris' ? 'login' : view === 'kayit' ? 'register' : view === 'yukle' ? 'upload' : view === 'google' ? 'google' : view;
    if (viewId === 'upload' && !currentUser) {
      showView('login');
      return;
    }
    if (allowed[viewId]) showView(viewId);
    else showView('home');
    if (viewId === 'home') doSearch('home');
    if (viewId === 'documents') {
      syncDocumentSelects();
      doSearch('documents');
    }
    if (viewId === 'google') initGoogleSearch();
  }

  function initGoogleSearch() {
    const cx = (window.OGRETMEN_DOKUMAN && window.OGRETMEN_DOKUMAN.googleCx) ? window.OGRETMEN_DOKUMAN.googleCx.trim() : '';
    const wrap = getEl('google-cse-wrap');
    const fallback = getEl('google-search-fallback');
    if (!wrap || !fallback) return;
    if (cx) {
      fallback.classList.add('hidden');
      wrap.classList.remove('hidden');
      if (!document.querySelector('script[data-google-cse]')) {
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-google-cse', '1');
        script.src = 'https://cse.google.com/cse.js?cx=' + encodeURIComponent(cx);
        document.body.appendChild(script);
      }
    } else {
      wrap.classList.add('hidden');
      fallback.classList.remove('hidden');
    }
  }

  // Event listeners
  function init() {
    fetchMe().then(() => {
      route();
      // Initialize theme after user fetch
      initTheme();
      initThemeToggle();
    });

    window.addEventListener('popstate', route);

    qsAll('[data-view]').forEach(el => {
      el.addEventListener('click', function (e) {
        if (this.tagName === 'A') {
          e.preventDefault();
          const v = this.getAttribute('data-view');
          if (v === 'upload' && !currentUser) {
            showView('login');
            return;
          }
          showView(v);
          if (v === 'documents') {
            syncDocumentSelects();
            doSearch('documents');
          }
          if (v === 'home') doSearch('home');
          if (v === 'google') initGoogleSearch();
        }
      });
    });

    const googleFallbackForm = getEl('google-fallback-form');
    if (googleFallbackForm) {
      googleFallbackForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const q = (getEl('google-fallback-q') && getEl('google-fallback-q').value) || '';
        if (q.trim()) window.open('https://www.google.com/search?q=' + encodeURIComponent(q.trim()), '_blank', 'noopener');
      });
    }

    const searchForm = getEl('search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        showView('documents');
        syncDocumentSelects();
        const typeEl = getEl('search-type');
        const catEl = getEl('search-category');
        const qEl = getEl('search-q');
        const typeD = getEl('search-type-docs');
        const catD = getEl('search-category-docs');
        const qD = getEl('search-q-docs');
        if (typeD) typeD.value = typeEl ? typeEl.value : 'tumu';
        if (catD) catD.value = catEl ? catEl.value : 'tumu';
        if (qD) qD.value = qEl ? qEl.value : '';
        doSearch('documents');
      });
    }

    const searchFormDocs = getEl('search-form-docs');
    if (searchFormDocs) {
      searchFormDocs.addEventListener('submit', function (e) {
        e.preventDefault();
        doSearch('documents');
      });
    }

    const formLogin = getEl('form-login');
    if (formLogin) {
      formLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        const msg = getEl('login-message');
        const fd = new FormData(this);
        fetch(API + '/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: fd.get('username'),
            password: fd.get('password')
          }),
          credentials: 'include'
        })
          .then(r => r.json())
          .then(data => {
            msg.classList.remove('hidden', 'success', 'error');
            msg.classList.add(data.ok ? 'success' : 'error');
            msg.textContent = data.message || (data.ok ? 'Giriş başarılı.' : 'Hata.');
            if (data.ok) {
              fetchMe();
              setTimeout(() => { showView('home'); doSearch('home'); }, 500);
            }
          })
          .catch(() => {
            msg.classList.remove('hidden', 'success');
            msg.classList.add('error');
            msg.textContent = 'Bağlantı hatası.';
          });
      });
    }

    const formRegister = getEl('form-register');
    if (formRegister) {
      formRegister.addEventListener('submit', function (e) {
        e.preventDefault();
        const msg = getEl('register-message');
        const fd = new FormData(this);
        fetch(API + '/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: fd.get('username'),
            email: fd.get('email') || undefined,
            password: fd.get('password')
          }),
          credentials: 'include'
        })
          .then(r => r.json())
          .then(data => {
            msg.classList.remove('hidden', 'success', 'error');
            msg.classList.add(data.ok ? 'success' : 'error');
            msg.textContent = data.message || (data.ok ? 'Kayıt başarılı.' : 'Hata.');
            if (data.ok) {
              msg.textContent += ' Giriş sayfasına yönlendiriliyorsunuz.';
              setTimeout(() => showView('login'), 1500);
            }
          })
          .catch(() => {
            msg.classList.remove('hidden', 'success');
            msg.classList.add('error');
            msg.textContent = 'Bağlantı hatası.';
          });
      });
    }

    const formUpload = getEl('form-upload');
    if (formUpload) {
      formUpload.addEventListener('submit', function (e) {
        e.preventDefault();
        const msg = getEl('upload-message');
        const fd = new FormData(this);
        fetch(API + '/api/documents', {
          method: 'POST',
          body: fd,
          credentials: 'include'
        })
          .then(r => r.json())
          .then(data => {
            msg.classList.remove('hidden', 'success', 'error');
            msg.classList.add(data.ok ? 'success' : 'error');
            msg.textContent = data.message || (data.ok ? 'Yüklendi.' : 'Hata.');
            if (data.ok) {
              this.reset();
              setTimeout(() => { showView('home'); doSearch('home'); }, 1200);
            }
          })
          .catch(() => {
            msg.classList.remove('hidden', 'success');
            msg.classList.add('error');
            msg.textContent = 'Yükleme hatası.';
          });
      });
    }

    const btnLogout = getEl('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', function () {
        fetch(API + '/api/logout', { method: 'POST', credentials: 'include' })
          .then(() => {
            currentUser = null;
            setNavUser(false);
            showView('home');
            doSearch('home');
          });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
