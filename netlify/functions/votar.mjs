// Records one vote. Each vote is its own blob whose key encodes the choice
// ("v/<voto>/<id>"), so concurrent votes never overwrite each other and the
// results can be counted from the key listing alone.

import { randomBytes } from "node:crypto";
import { store, isValidVote, lerJson } from "./_shared/store.mjs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const payload = await lerJson(req);
  if (!payload || !isValidVote(payload.voto)) {
    return Response.json({ ok: false, error: "Voto inválido" }, { status: 400 });
  }

  const id = `${Date.now()}-${randomBytes(6).toString("hex")}`;
  await store().set(`v/${payload.voto}/${id}`, "1");
  return Response.json({ ok: true });
};
