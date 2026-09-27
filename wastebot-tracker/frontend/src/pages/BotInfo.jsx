import { useMemo } from 'react';
import { useBots, sectorsFromBots, botsInSector } from '../hooks/useBots.js';

const SPECS = [
  ['Base', 'Metallic chassis'],
  ['Controller', 'Arduino UNO'],
  ['Camera', 'ESP camera module'],
  ['Motor driver', 'L298N (dual)'],
  ['Manipulator', 'Robotic arm'],
  ['Cloud sync', 'Firebase Realtime DB'],
  ['Auth', 'Firebase Authentication']
];
const PLANNED = [
  ['Simulation', 'Webots (3D)'],
  ['Vision model', 'YOLO + OpenCV'],
  ['Path planning', 'A* / Dijkstra']
];

export default function BotInfo() {
  const bots = useBots();
  const sectors = useMemo(() => sectorsFromBots(bots), [bots]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Bot info</h2>
        <p className="text-sm text-muted">Hardware reference and fleet layout</p>
      </div>
      <div className="grid md:grid-cols-2 gap-3.5">
        <Panel title="Specifications (per bot)" rows={SPECS} />
        <div className="bg-surface border border-line rounded-xl p-4.5">
          <h3 className="text-sm font-bold mb-3">Fleet layout</h3>
          {sectors.map((s) => (
            <Row
              key={s}
              label={`Sector ${s}`}
              value={`${botsInSector(bots, s).length} bots — ${botsInSector(bots, s)
                .map((b) => b.id.split('-')[1])
                .join(', ')}`}
            />
          ))}
          <h3 className="text-sm font-bold mt-5 mb-3">Planned extension</h3>
          {PLANNED.map(([k, v]) => (
            <Row key={k} label={k} value={v} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, rows }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-4.5">
      <h3 className="text-sm font-bold mb-3">{title}</h3>
      {rows.map(([k, v]) => (
        <Row key={k} label={k} value={v} />
      ))}
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-line last:border-none text-sm">
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
