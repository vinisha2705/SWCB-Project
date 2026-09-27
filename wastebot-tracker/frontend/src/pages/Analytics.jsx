import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useBots } from '../hooks/useBots.js';
import { useAlerts, useHistory } from '../hooks/useAlerts.js';

export default function Analytics() {
  const bots = useBots();
  const alerts = useAlerts();

  // The backend writes rolling fleet averages to /history in Firebase
  // (see services/simulator.js) so this chart reflects real trend data
  // rather than a single snapshot.
  const history = useHistory();

  const alertCounts = useMemo(() => {
    const counts = {};
    alerts.forEach((a) => { counts[a.type] = (counts[a.type] || 0) + 1; });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [alerts]);

  const online = bots.filter((b) => b.connected).length;
  const active = alerts.filter((a) => a.status === 'active').length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Analytics</h2>
        <p className="text-sm text-muted">
          Fleet-wide performance this session · {bots.length} bots
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-3.5 mb-5">
        <div className="bg-surface border border-line rounded-xl p-4.5">
          <h3 className="text-sm font-bold mb-3">Avg battery vs waste level</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid stroke="#2A3830" />
                <XAxis dataKey="time" stroke="#8FA396" fontSize={11} />
                <YAxis stroke="#8FA396" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#161F1A', border: '1px solid #2A3830' }} />
                <Line type="monotone" dataKey="battery" stroke="#7FB069" dot={false} />
                <Line type="monotone" dataKey="waste" stroke="#E8A33D" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-xl p-4.5">
          <h3 className="text-sm font-bold mb-3">Alerts by type</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertCounts}>
                <CartesianGrid stroke="#2A3830" />
                <XAxis dataKey="type" stroke="#8FA396" fontSize={11} />
                <YAxis stroke="#8FA396" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#161F1A', border: '1px solid #2A3830' }} />
                <Bar dataKey="count" fill="#7FB069" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Stat label="Bots online" value={`${online}/${bots.length}`} />
        <Stat label="Total alerts" value={alerts.length} />
        <Stat label="Active alerts" value={active} />
        <Stat label="Sectors" value={new Set(bots.map((b) => b.sector)).size} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-3.5">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-2xl font-bold mt-1.5">{value}</div>
    </div>
  );
}
