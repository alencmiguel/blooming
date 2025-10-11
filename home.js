(function(){
  const $ = (q,root=document)=>root.querySelector(q);
  const getPosts = () => {
    try { return JSON.parse(localStorage.getItem('blooming_posts')) || []; }
    catch { return []; }
  };

  const list = getPosts()
    .filter(p=>!p.hidden)
    .sort((a,b)=> (b.votes||0)-(a.votes||0) || b.ts-a.ts)
    .slice(0, 2);

  const box = $('#postsHome');
  if(!box) return;

  if(list.length === 0){
    box.innerHTML = `<div class="notice">
      Ainda não há publicações. <a href="forum.html">Crie a primeira!</a>
    </div>`;
    return;
  }

  for(const p of list){
    const tags = (p.tags||[]).map(t=>`<span class="pill">#${t}</span>`).join(' ');
    const el = document.createElement('article');
    el.className = 'post';
    el.innerHTML = `
      <div class="meta">${p.category} • por <strong>${p.author||'Anônima'}</strong></div>
      <div class="title"><a class="post-link" href="post.html?id=${encodeURIComponent(p.id)}">${p.title}</a></div>
      <div class="body">
        ${(p.content||'').length>180 ? p.content.slice(0,180)+'…' : (p.content||'')}
      </div>
      <div class="row">
        <div class="chips">${tags}</div>
        <a class="pill pill-btn" href="post.html?id=${encodeURIComponent(p.id)}">Abrir</a>
      </div>
    `;
    box.appendChild(el);
  }
})();
