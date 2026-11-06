import { getStore } from "@netlify/blobs";
import { randomBytes, createHash } from "node:crypto";

const store = getStore("diario-forex-cuentas");
const json = (data, status=200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store" } });
const hash = value => createHash("sha256").update(value).digest("hex");

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, {status:204, headers:{"Access-Control-Allow-Methods":"POST, OPTIONS", "Access-Control-Allow-Headers":"Content-Type"}});
  if (req.method !== "POST") return json({error:"Método no permitido"},405);
  try {
    const body = await req.json();
    if (body.a === "register") {
      const name = String(body.name || "").trim().slice(0,60);
      if (!name) return json({error:"Escribe un nombre para tu cuenta."},400);
      const token = "FX" + randomBytes(15).toString("hex").toUpperCase();
      await store.setJSON(hash(token), {name,data:null,createdAt:new Date().toISOString()});
      return json({token,name});
    }
    const token = String(body.token || "");
    if (!/^FX[A-F0-9]{30}$/.test(token)) return json({error:"Token inválido."},401);
    const id = hash(token);
    const account = await store.get(id,{type:"json"});
    if (!account) return json({error:"Token no reconocido."},401);
    if (body.a === "load") return json({name:account.name,data:account.data});
    if (body.a === "save") {
      if (typeof body.data !== "string" || body.data.length > 2000000) return json({error:"Datos no válidos."},400);
      try { JSON.parse(body.data); } catch { return json({error:"Los datos están dañados."},400); }
      account.data=body.data; account.updatedAt=new Date().toISOString();
      await store.setJSON(id,account);
      return json({ok:true});
    }
    return json({error:"Acción no válida."},400);
  } catch (error) { console.error(error); return json({error:"Error interno del servidor."},500); }
};
