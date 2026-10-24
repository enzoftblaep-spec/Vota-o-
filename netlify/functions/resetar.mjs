// Deletes every vote. Same password as the results.

import { store, senhaCorreta, lerJson } from "./_shared/store.mjs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const payload = await lerJson(req);
  if (!payload || !senhaCorreta(payload.senha)) {
    return Response.json({ ok: false, error: "Senha incorreta" }, { status: 401 });
  }

  const s = store();
  const { blobs } = await s.list({ prefix: "v/" });
  for (let i = 0; i < blobs.length; i += 50) {
    await Promise.all(blobs.slice(i, i + 50).map(({ key }) => s.delete(key)));
  }
  return Response.json({ ok: true, apagados: blobs.length });
};
