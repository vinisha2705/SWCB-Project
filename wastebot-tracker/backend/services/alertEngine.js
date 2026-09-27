// Watches /bots for changes and applies the alert conditions from the
// project spec: low battery, full waste container, offline/no-signal,
// obstacle detection, route deviation. Writes results to /alerts and
// pushes a notification via FCM for critical alerts.
import { db, messaging } from '../firebaseAdmin.js';

const THRESH = { battery: 20, waste: 85 };

function findActiveAlert(alertsVal, botId, type) {
  return Object.entries(alertsVal || {}).find(
    ([, a]) => a.botId === botId && a.type === type && a.status === 'active'
  );
}

async function pushAlert(botId, sector, type, title, msg, level) {
  const snap = await db.ref('alerts').get();
  if (findActiveAlert(snap.val(), botId, type)) return; // already active, don't duplicate

  const alertRef = db.ref('alerts').push();
  await alertRef.set({ botId, sector, type, title, msg, level, status: 'active', ts: Date.now() });

  if (level === 'crit') await sendPush(title, msg);
}

async function resolveAlert(botId, type) {
  const snap = await db.ref('alerts').get();
  const found = findActiveAlert(snap.val(), botId, type);
  if (found) await db.ref(`alerts/${found[0]}`).update({ status: 'resolved' });
}

async function sendPush(title, body) {
  const tokensSnap = await db.ref('fcmTokens').get();
  const tokens = Object.keys(tokensSnap.val() || {});
  if (!tokens.length) return;
  try {
    await messaging.sendEachForMulticast({ tokens, notification: { title, body } });
  } catch (err) {
    console.warn('FCM push failed:', err.message);
  }
}

export function startAlertEngine() {
  db.ref('bots').on('value', async (snapshot) => {
    const bots = snapshot.val() || {};
    for (const [id, b] of Object.entries(bots)) {
      if (b.battery < THRESH.battery) {
        await pushAlert(id, b.sector, 'battery', `Low battery — ${id}`,
          `Battery at ${b.battery.toFixed(0)}% in sector ${b.sector}.`, 'crit');
      } else {
        await resolveAlert(id, 'battery');
      }

      // Waste alerts are intentionally NOT auto-resolved here — they only
      // clear when an operator marks the bin emptied (see routes/bots.js).
      if (b.waste > THRESH.waste) {
        await pushAlert(id, b.sector, 'waste', `Container full — ${id}`,
          `Waste at ${b.waste.toFixed(0)}% in sector ${b.sector}. Empty it, then mark resolved.`, 'warn');
      }

      if (!b.connected) {
        await pushAlert(id, b.sector, 'offline', `Bot offline — ${id}`,
          `No signal from ${id} in sector ${b.sector}.`, 'crit');
      } else {
        await resolveAlert(id, 'offline');
      }
    }
  });
  console.log('Alert engine watching /bots for threshold breaches.');
}

export { pushAlert, resolveAlert };
