// ====== Utilidades & Persistência ======
const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];
const store = {
  get(){ try { return JSON.parse(localStorage.getItem('blooming_posts')) || []; } catch { return []; } },
  set(data){ localStorage.setItem('blooming_posts', JSON.stringify(data)); }
};

// ====== Dados iniciais (seed) ======
const seed = [
  { id: crypto.randomUUID(), title:"Cólica forte no 1º dia, dicas?", category:"Menstruação", content:"No primeiro dia sempre sinto muita cólica. O que ajuda vocês?", tags:["cólica","1º dia"], author:"Luna", ts: Date.now()-86400000, likes:2, hidden:false },
  { id: crypto.randomUUID(), title:"DIU e fluxo: aumenta mesmo?", category:"Saúde hormonal", content:"Coloquei DIU de cobre há 3 meses. Meu fluxo parece maior. É normal?", tags:["DIU","fluxo"], author:"Anônima", ts: Date.now()-43200000, likes:4, hidden:false },
  { id: crypto.randomUUID(), title:"TPM e ansiedade — como vocês lidam?", category:"Bem-estar", content:"Ideias de rotina de autocuidado para a semana pré-menstrual.", tags:["TPM","ansiedade"], author:"Maya", ts: Date.now()-7200000, likes:1, hidden:false }
];
if (store.get().length === 0) store.set(seed);

// ====== Regras simples de segurança/moderação (client-side) ======
const banned = ["http://","https://","telefone","whatsapp","cpf","rg","endereço","assédio","ódio","idiota","burra","tapa","morrer"]; // simples; apenas exemplo
function failsModeration(text){
  const t = (text||"").toLowerCase();
  return banned.some(w => t.includes(w));
}

// ====== Renderização de posts ======
function timeAgo(ts){
  const diff = Math.max(1, Math.floor((Date.now()-ts)/1000));
  const units = [[31536000,'ano'],[2592000,'mês'],[604800,'semana'],[86400,'dia'],[3600,'hora'],[60,'minuto'],[1,'segundo']];
  for(const [s, name] of units){
    if(diff >= s){
      const v = Math.floor(diff/s);
      return `${v} ${name}${v>1 && name!=='mês' ? 's':''} atrás`;
    }
  }
  return 'agora';
}

function render(){
  const list = store.get().filter(p=>!p.hidden);
  const q = $('#search').value.trim().toLowerCase();
  const cat = $('#filterCat').value;
  const filtered = list.filter(p=>{
    const inCat = !cat || p.category === cat;
    const blob = `${p.title} ${p.content} ${p.tags.join(' ')}`.toLowerCase();
    const inQ = !q || blob.includes(q);
    return inCat && inQ;
  }).sort((a,b)=> b.ts - a.ts);

  const posts = $('#posts');
  posts.innerHTML = '';
  if(filtered.length === 0){
    posts.innerHTML = `<div class="notice">Nenhum tópico encontrado. Tente outra busca ou categoria.</div>`;
    return;
  }

  for(const p of filtered){
    const el = document.createElement('article');
    el.className = 'post';
    const tags = p.tags.map(t=>`<span class="pill">#${t}</span>`).join(' ');
    el.innerHTML = `
      <div class="meta">${p.category} • por <strong>${p.author||'Anônima'}</strong> • ${timeAgo(p.ts)}</div>
      <div class="title">${p.title}</div>
      <div class="body">${p.content}</div>
      <div class="row">
        <div class="chips">${tags}</div>
        <div class="chips">
          <button class="pill pill-btn" aria-label="curtir"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61A5.5 5.5 0 0 0 12 8.28 5.5 5.5 0 0 0 3.16 4.61C1.6 6.17 1.6 8.78 3.16 10.34l8.84 8.83 8.84-8.83c1.56-1.56 1.56-4.17 0-5.73Z"/></svg> <span>${p.likes||0}</span></button>
          <button class="pill pill-btn" aria-label="reportar" title="Sinalizar/ocultar localmente">🚩 Sinalizar</button>
        </div>
      </div>`;

    const [likeBtn, reportBtn] = el.querySelectorAll('.pill-btn');
    likeBtn.addEventListener('click', ()=>{ p.likes=(p.likes||0)+1; save(); render(); });
    reportBtn.addEventListener('click', ()=>{ if(confirm('Ocultar este tópico do seu feed?')){ p.hidden = true; save(); render(); } });

    posts.appendChild(el);
  }
}

function save(){ store.set(store.get()); }

// ====== Eventos ======
$('#search').addEventListener('input', render);
$('#filterCat').addEventListener('change', render);

$('#postForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const author = $('#anonToggle').checked ? 'Anônima' : ($('#nick').value.trim()||'Anônima');
  const title = $('#title').value.trim();
  const content = $('#content').value.trim();
  const category = $('#category').value;
  const tags = $('#tags').value.split(',').map(s=>s.trim()).filter(Boolean);

  if(failsModeration(title+"\n"+content)){
    alert('Sua mensagem contém palavras/dados não permitidos. Remova termos ofensivos ou dados pessoais.');
    return;
  }

  const posts = store.get();
  posts.push({ id: crypto.randomUUID(), title, content, category, tags, author, ts: Date.now(), likes:0, hidden:false });
  store.set(posts);

  e.target.reset();
  $('#anonToggle').checked = false;
  render();
  location.hash = '#forum';
});

// Armazena referência do array para editar no lugar
store.set(store.get());
render();
