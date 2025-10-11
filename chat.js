// === CONFIG ===
// usa 127.0.0.1 para evitar resoluções estranhas de localhost
const API_BASE =
  (location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:3000'   // se mudou a porta, troque aqui (ex.: 4000)
    : 'https://SEU_BACKEND_EM_PRODUCAO'; // quando publicar

const API_URL = `${API_BASE}/api/chat`;


// === UI minimalista, respeitando seu tema ===
(function () {
  // injeta HTML do widget
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
  <div id="blooming-chat-fab" aria-label="Abrir chat">💬</div>
  <div id="blooming-chat-panel" hidden>
    <div class="bc-head">
      <strong>Blooming Chat</strong>
      <button id="bc-close" title="Fechar">✕</button>
    </div>
    <div id="bc-messages" class="bc-messages">
      <div class="bc-bot">Oi! Sou a assistente do Blooming 🌸
        Posso ajudar com dúvidas gerais. Lembre: não substituo atendimento médico.</div>
    </div>
    <form id="bc-form" class="bc-form">
      <input id="bc-input" placeholder="Escreva sua pergunta..." autocomplete="off" />
      <button>Enviar</button>
    </form>
  </div>`;
  document.body.appendChild(wrapper);

  const fab = document.getElementById("blooming-chat-fab");
  const panel = document.getElementById("blooming-chat-panel");
  const closeBtn = document.getElementById("bc-close");
  const form = document.getElementById("bc-form");
  const input = document.getElementById("bc-input");
  const box = document.getElementById("bc-messages");

  function open() { panel.hidden = false; input.focus(); }
  function close() { panel.hidden = true; }
  fab.addEventListener("click", open);
  closeBtn.addEventListener("click", close);

  function addMsg(text, who = "user") {
    const div = document.createElement("div");
    div.className = who === "user" ? "bc-user" : "bc-bot";
    div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    addMsg(q, "user");
    input.value = "";
    addMsg("Digitando…", "bot");

    try {
      const r = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q })
      });
      const data = await r.json();
      // remove o "Digitando…"
      const typing = box.querySelector(".bc-bot:last-child");
      if (typing) typing.remove();
      addMsg(data.reply || "…", "bot");
    } catch (err) {
      const typing = box.querySelector(".bc-bot:last-child");
      if (typing) typing.remove();
      addMsg("Deu erro por aqui. Tente novamente em instantes.", "bot");
    }
  });
})();
