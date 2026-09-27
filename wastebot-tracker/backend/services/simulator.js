// Stands in for real bot hardware until it's wired up: seeds a fleet of
// 3-4 bots per sector and writes changing telemetry to Firebase every
// few seconds, plus rolling fleet-average history for the analytics chart.
// Turn this off (RUN_SIMULATOR=false in .env) once real bots are pushing
// their own data to /bots.
import { db } from '../firebaseAdmin.js';

const SECTORS = ['A1', 'A2', 'B1', 'B2'];
const rand = (min, max) => min + Math.random() * (max - min);

async function seedIfEmpty() {
  const snap = await db.ref('bots').get();
  if (snap.exists()) return;
  const bots = {};
  SECTORS.forEach((sector) => {
    const n = 3 + (Math.random() < 0.5 ? 0 : 1);
    for (let i = 1; i <= n; i++) {
      const id = `${sector}-B${i}`;
      bots[id] = {
        id, sector,
        battery: +rand(60, 90).toFixed(0),
        waste: +rand(10, 45).toFixed(0),
        distance: 0,
        connected: true,
        speed: 0,
        x: +rand(20, 280).toFixed(0),
        y: +rand(20, 160).toFixed(0)
      };
    }
  });
  await db.ref('bots').set(bots);
  console.log(`Simulator seeded ${Object.keys(bots).length} bots across ${SECTORS.length} sectors.`);
}

export function startSimulator() {
  seedIfEmpty();
  setInterval(async () => {
    const snap = await db.ref('bots').get();
    const bots = snap.val() || {};
    const updates = {};
    Object.entries(bots).forEach(([id, b]) => {
      updates[`bots/${id}/battery`] = Math.max(3, Math.min(100, b.battery + rand(-1.5, 1.2)));
      updates[`bots/${id}/waste`] = Math.max(0, Math.min(100, b.waste + rand(-0.3, 2.4)));
      updates[`bots/${id}/distance`] = b.distance + rand(0, 0.05);
      updates[`bots/${id}/speed`] = +rand(0.1, 0.7).toFixed(1);
      updates[`bots/${id}/x`] = Math.max(15, Math.min(285, b.x + rand(-7, 7)));
      updates[`bots/${id}/y`] = Math.max(15, Math.min(155, b.y + rand(-7, 7)));
      updates[`bots/${id}/connected`] = Math.random() > 0.012;
    });
    await db.ref().update(updates);

    const fresh = Object.values((await db.ref('bots').get()).val() || {});
    const avgBattery = fresh.reduce((s, b) => s + b.battery, 0) / fresh.length;
    const avgWaste = fresh.reduce((s, b) => s + b.waste, 0) / fresh.length;
    const histRef = db.ref('history').push();
    await histRef.set({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      battery: +avgBattery.toFixed(0),
      waste: +avgWaste.toFixed(0)
    });
    // Keep only the most recent 18 history points.
    const histSnap = await db.ref('history').get();
    const entries = Object.entries(histSnap.val() || {});
    if (entries.length > 18) {
      const toRemove = entries.slice(0, entries.length - 18);
      const cleanup = {};
      toRemove.forEach(([key]) => (cleanup[`history/${key}`] = null));
      await db.ref().update(cleanup);
    }
  }, 2600);
  console.log('Bot simulator running (every 2.6s). Set RUN_SIMULATOR=false once real bots connect.');
}
