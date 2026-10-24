// Returns the vote count per choice. Password-protected (VOTOS_SENHA env var,
// "1907" by default).

const { store, json, senhaCorreta } = require("./_shared/store");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Invalid JSON" });
  }

  if (!senhaCorreta(payload.senha)) {
    return json(401, { ok: false, error: "Senha incorreta" });
  }

  const { blobs } = await store().list({ prefix: "v/" });
  const contagem = {};
  for (const { key } of blobs) {
    const voto = key.split("/")[1];
    contagem[voto] = (contagem[voto] || 0) + 1;
  }
  return json(200, { ok: true, contagem, total: blobs.length });
};
