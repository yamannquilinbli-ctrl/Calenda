import { getStore } from '@netlify/blobs';
import { randomBytes } from 'node:crypto';

const store = getStore('calendario-forex-users');
const json = (status, payload) => new Response(JSON.stringify(payload), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

export default async (request) => {
  if (request.method !== 'POST') return json(405, { error: 'Método no permitido.' });

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'Solicitud inválida.' });
  }

  if (body.a === 'register') {
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 40) : '';
    const token = 'FX' + randomBytes(10).toString('hex').toUpperCase();
    try {
      await store.setJSON(token, { name: name || 'Mi cuenta', data: null });
      return json(200, { token, name: name || 'Mi cuenta' });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return json(500, { error: 'No se pudo crear la cuenta. Inténtalo de nuevo.' });
    }
  }

  const token = typeof body.token === 'string' ? body.token.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
  if (!/^FX[A-F0-9]{20}$/.test(token)) return json(401, { error: 'Token inválido.' });

  try {
    const user = await store.get(token, { type: 'json' });
    if (!user) return json(401, { error: 'Token no válido o cuenta inexistente.' });

    if (body.a === 'load') {
      return json(200, { name: user.name || 'Mi cuenta', data: user.data ?? null });
    }

    if (body.a === 'save') {
      if (typeof body.data !== 'string' || body.data.length > 2_000_000) {
        return json(400, { error: 'Los datos enviados no son válidos o son demasiado grandes.' });
      }
      let parsed;
      try { parsed = JSON.parse(body.data); }
      catch { return json(400, { error: 'El historial tiene un formato inválido.' }); }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return json(400, { error: 'El historial tiene un formato inválido.' });
      }
      await store.setJSON(token, { name: user.name || 'Mi cuenta', data: body.data });
      return json(200, { ok: true });
    }

    return json(400, { error: 'Acción desconocida.' });
  } catch (error) {
    console.error('Error en Calendario Forex:', error);
    return json(500, { error: 'Error interno del servidor.' });
  }
};
