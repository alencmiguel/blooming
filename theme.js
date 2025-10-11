// theme.js
(function(){
  const KEY = 'blooming_theme';
  const root = document.documentElement;
  function apply(t){
    root.setAttribute('data-theme', t);
    localStorage.setItem(KEY, t);
    const btn = document.getElementById('themeToggle');
    if(btn) btn.textContent = (t === 'dark') ? 'Modo claro' : 'Modo escuro';
  }
  // inicial
  const saved = localStorage.getItem(KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  apply(saved || (prefersDark ? 'dark' : 'light'));

  // toggle
  document.addEventListener('click', (e)=>{
    if(e.target && e.target.id === 'themeToggle'){
      const now = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(now);
    }
  });
})();
