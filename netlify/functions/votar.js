// Records one vote. Each vote is its own blob whose key encodes the choice
// ("v/<voto>/<id>"), so concurrent votes never overwrite each other and the
// results can be counted from the key listing alone.

const crypto = require("crypto");
const { store, json, isValidVote } = require("./_shared/store");

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

  if (!isValidVote(payload.voto)) {
    return json(400, { ok: false, error: "Voto inválido" });
  }

  const id = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  await store(event).set(`v/${payload.voto}/${id}`, "1");
  return json(200, { ok: true });
};
