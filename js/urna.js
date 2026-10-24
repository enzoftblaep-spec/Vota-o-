(function () {
  const CANDIDATOS = window.CANDIDATOS || [];
  const DIGITOS = 2;

  const tela = document.getElementById("tela");

  // estado: "inicio" | "digitando" | "branco" | "fim"
  let estado = "inicio";
  let numero = "";

  // ---------- sons (Web Audio, sem arquivos) ----------
  let audio;
  function ctx() {
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    return audio;
  }
  function bip(freq, inicio, duracao) {
    const a = ctx();
    const osc = a.createOscillator();
    const ganho = a.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    ganho.gain.value = 0.08;
    osc.connect(ganho).connect(a.destination);
    osc.start(a.currentTime + inicio);
    osc.stop(a.currentTime + inicio + duracao);
  }
  function somTecla() {
    try { bip(1100, 0, 0.07); } catch (e) {}
  }
  // o "piriri" do fim do voto
  function somConfirma() {
    try {
      for (let i = 0; i < 5; i++) bip(i % 2 ? 950 : 1250, i * 0.09, 0.08);
      bip(1250, 0.5, 0.5);
    } catch (e) {}
  }

  // ---------- telas ----------
  function candidatoAtual() {
    return CANDIDATOS.find((c) => c.numero === numero);
  }

  function caixasDigitos() {
    let html = '<span class="digitos">';
    for (let i = 0; i < DIGITOS; i++) {
      const d = numero[i] || "";
      const pisca = i === numero.length ? " piscando" : "";
      html += `<span class="digito${pisca}">${d}</span>`;
    }
    return html + "</span>";
  }

  const INSTRUCOES = `
    <div class="instrucoes">
      Aperte a tecla:<br>
      <b>CONFIRMA</b> para CONFIRMAR este voto<br>
      <b>CORRIGE</b> para REINICIAR este voto
    </div>`;

  function render() {
    if (estado === "inicio") {
      tela.innerHTML = `
        <div class="cabecalho">SEU VOTO PARA</div>
        <div class="cargo">Presidente</div>
        <div class="linha"><b>Número:</b> ${caixasDigitos()}</div>`;
      return;
    }

    if (estado === "branco") {
      tela.innerHTML = `
        <div class="cabecalho">SEU VOTO PARA</div>
        <div class="cargo">Presidente</div>
        <div class="grande piscando">VOTO EM BRANCO</div>
        ${INSTRUCOES}`;
      return;
    }

    if (estado === "fim") {
      tela.innerHTML = '<div class="fim">FIM</div>';
      return;
    }

    // digitando
    let html = `
      <div class="cabecalho">SEU VOTO PARA</div>
      <div class="cargo">Presidente</div>
      <div class="linha"><b>Número:</b> ${caixasDigitos()}</div>`;

    if (numero.length === DIGITOS) {
      const c = candidatoAtual();
      if (c) {
        html += `
          <div class="linha"><b>Nome:</b> ${escapar(c.nome)}</div>
          <div class="linha"><b>Partido:</b> ${escapar(c.partido)}</div>
          <div class="foto"><img src="${c.foto}" alt="${escapar(c.nome)}">Presidente</div>`;
      } else {
        html += `
          <div class="linha">NÚMERO ERRADO</div>
          <div class="grande piscando">VOTO NULO</div>`;
      }
      html += INSTRUCOES;
    }
    tela.innerHTML = html;
  }

  function escapar(s) {
    return String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  // ---------- teclas ----------
  function digitar(d) {
    if (estado === "fim" || estado === "branco") return;
    if (numero.length >= DIGITOS) return;
    somTecla();
    numero += d;
    estado = "digitando";
    render();
  }

  function branco() {
    if (estado === "fim" || numero.length > 0) return;
    somTecla();
    estado = "branco";
    render();
  }

  function corrige() {
    if (estado === "fim") return;
    somTecla();
    numero = "";
    estado = "inicio";
    render();
  }

  function confirma() {
    let voto;
    if (estado === "branco") voto = "branco";
    else if (estado === "digitando" && numero.length === DIGITOS) voto = numero;
    else return;

    somConfirma();
    estado = "fim";
    render();
    registrarVoto(voto);

    setTimeout(() => {
      numero = "";
      estado = "inicio";
      render();
    }, 3000);
  }

  async function registrarVoto(voto) {
    try {
      const r = await fetch("/.netlify/functions/votar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voto }),
      });
      if (!r.ok) throw new Error(r.status);
    } catch (e) {
      console.error("Falha ao registrar voto", e);
      alert("Não foi possível registrar o voto. Verifique a internet e tente de novo.");
    }
  }

  document.querySelectorAll("[data-num]").forEach((b) =>
    b.addEventListener("click", () => digitar(b.dataset.num))
  );
  document.getElementById("btn-branco").addEventListener("click", branco);
  document.getElementById("btn-corrige").addEventListener("click", corrige);
  document.getElementById("btn-confirma").addEventListener("click", confirma);

  // teclado do computador também funciona
  document.addEventListener("keydown", (e) => {
    if (document.querySelector("dialog[open]")) return;
    if (/^\d$/.test(e.key)) digitar(e.key);
    else if (e.key === "Enter") confirma();
    else if (e.key === "Backspace" || e.key === "Escape") corrige();
  });

  // ---------- ver votos (com senha) ----------
  const dlgSenha = document.getElementById("dlg-senha");
  const dlgResultados = document.getElementById("dlg-resultados");
  const inputSenha = document.getElementById("senha");
  const erroSenha = document.getElementById("erro-senha");
  let senhaOk = "";

  document.getElementById("btn-ver-votos").addEventListener("click", () => {
    inputSenha.value = "";
    erroSenha.hidden = true;
    dlgSenha.showModal();
  });
  document.getElementById("btn-cancelar").addEventListener("click", () => dlgSenha.close());
  document.getElementById("btn-fechar").addEventListener("click", () => {
    senhaOk = "";
    dlgResultados.close();
  });
  document.getElementById("btn-atualizar").addEventListener("click", () => carregarResultados(senhaOk));

  document.getElementById("form-senha").addEventListener("submit", async (e) => {
    e.preventDefault();
    const senha = inputSenha.value;
    const dados = await buscarResultados(senha);
    if (!dados) return;
    senhaOk = senha;
    dlgSenha.close();
    mostrarResultados(dados);
    dlgResultados.showModal();
  });

  async function buscarResultados(senha) {
    try {
      const r = await fetch("/.netlify/functions/resultados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      const dados = await r.json();
      if (!r.ok || !dados.ok) {
        erroSenha.textContent = dados.error || "Erro ao buscar votos";
        erroSenha.hidden = false;
        return null;
      }
      return dados;
    } catch (e) {
      erroSenha.textContent = "Sem conexão com o servidor";
      erroSenha.hidden = false;
      return null;
    }
  }

  async function carregarResultados(senha) {
    const dados = await buscarResultados(senha);
    if (dados) mostrarResultados(dados);
  }

  function mostrarResultados({ contagem, total }) {
    const linhas = CANDIDATOS.map((c) => ({
      nome: c.nome,
      sub: `${c.numero} · ${c.partido}`,
      foto: c.foto,
      qtd: contagem[c.numero] || 0,
    }));

    // números que não são de nenhum candidato contam como nulo
    const numerosValidos = new Set(CANDIDATOS.map((c) => c.numero));
    let nulos = 0;
    for (const [voto, qtd] of Object.entries(contagem)) {
      if (voto !== "branco" && !numerosValidos.has(voto)) nulos += qtd;
    }

    linhas.sort((a, b) => b.qtd - a.qtd);
    linhas.push({ nome: "Brancos", sub: "", qtd: contagem.branco || 0 });
    linhas.push({ nome: "Nulos", sub: "", qtd: nulos });

    const lista = document.getElementById("lista-resultados");
    lista.innerHTML = linhas.map((l) => {
      const pct = total ? Math.round((l.qtd / total) * 1000) / 10 : 0;
      const img = l.foto ? `<img src="${l.foto}" alt="">` : '<span class="sem-foto"></span>';
      return `
        <li>
          ${img}
          <div>
            <div class="nome">${escapar(l.nome)}</div>
            <div class="sub">${escapar(l.sub)}</div>
            <div class="barra"><span style="width:${pct}%"></span></div>
          </div>
          <div class="qtd"><b>${l.qtd}</b><br><small>${pct}%</small></div>
        </li>`;
    }).join("");
    document.getElementById("total-votos").textContent = `Total de votos: ${total}`;
  }

  render();
})();
