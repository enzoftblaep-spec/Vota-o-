// Returns the vote count per choice. Password-protected (VOTOS_SENHA env var,
// "1907" by default).

import { store, senhaCorreta, lerJson } from "./_shared/store.mjs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const payload = await lerJson(req);
  if (!payload || !senhaCorreta(payload.senha)) {
    return Response.json({ ok: false, error: "Senha incorreta" }, { status: 401 });
  }

  const { blobs } = await store().list({ prefix: "v/" });
  const contagem = {};
  for (const { key } of blobs) {
    const voto = key.split("/")[1];
    contagem[voto] = (contagem[voto] || 0) + 1;
  }
  return Response.json({ ok: true, contagem, total: blobs.length });
};
