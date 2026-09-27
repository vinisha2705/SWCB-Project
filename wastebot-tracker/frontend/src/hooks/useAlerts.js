// Subscribes to /alerts in the Realtime Database. The backend's alert
// engine is what actually writes to this node; the frontend only reads
// and, for actions like "mark emptied", calls the backend API.
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase.js';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const alertsRef = ref(db, 'alerts');
    const unsub = onValue(alertsRef, (snapshot) => {
      const val = snapshot.val() || {};
      const list = Object.entries(val)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.ts - a.ts);
      setAlerts(list);
    });
    return () => unsub();
  }, []);

  return alerts;
}

// Rolling fleet-average snapshots the backend writes to /history, each
// shaped { time, battery, waste }. Used for the analytics trend chart.
export function useHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const historyRef = ref(db, 'history');
    const unsub = onValue(historyRef, (snapshot) => {
      const val = snapshot.val() || {};
      setHistory(Object.values(val));
    });
    return () => unsub();
  }, []);

  return history;
}
