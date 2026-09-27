// Subscribes to /bots in the Realtime Database and keeps local state in
// sync live. Each bot record looks like:
// { id, sector, battery, waste, distance, connected, speed, x, y }
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase.js';

export function useBots() {
  const [bots, setBots] = useState([]);

  useEffect(() => {
    const botsRef = ref(db, 'bots');
    const unsub = onValue(botsRef, (snapshot) => {
      const val = snapshot.val() || {};
      setBots(Object.entries(val).map(([id, data]) => ({ id, ...data })));
    });
    return () => unsub();
  }, []);

  return bots;
}

export function botsInSector(bots, sector) {
  return bots.filter((b) => b.sector === sector);
}

export function sectorsFromBots(bots) {
  return [...new Set(bots.map((b) => b.sector))].sort();
}
