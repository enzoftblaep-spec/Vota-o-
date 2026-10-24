import { getStore } from "@netlify/blobs";

// Strong consistency so a vote shows up in the results right away (the
// default edge cache can lag up to 60s). Needs the modern function format
// (export default), which is what provides the uncached Blobs URL.
export function store() {
  return getStore({ name: "urna-votos", consistency: "strong" });
}

// A vote is either a 2-digit number (a candidate, or a null vote when no
// candidate has that number) or "branco".
export function isValidVote(v) {
  return typeof v === "string" && /^(\d{2}|branco)$/.test(v);
}

export function senhaCorreta(senha) {
  const esperada = process.env.VOTOS_SENHA || "1907";
  return typeof senha === "string" && senha.replace(/\D/g, "") === esperada;
}

export async function lerJson(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
