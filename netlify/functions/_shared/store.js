const { getStore } = require("@netlify/blobs");

function store() {
  return getStore("urna-votos");
}

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}

// A vote is either a 2-digit number (a candidate, or a null vote when no
// candidate has that number) or "branco".
function isValidVote(v) {
  return typeof v === "string" && /^(\d{2}|branco)$/.test(v);
}

function senhaCorreta(senha) {
  const esperada = process.env.VOTOS_SENHA || "1907";
  return typeof senha === "string" && senha.replace(/\D/g, "") === esperada;
}

module.exports = { store, json, isValidVote, senhaCorreta };
