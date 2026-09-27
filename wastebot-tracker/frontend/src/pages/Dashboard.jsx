import { useState, useMemo } from 'react';
import { useBots, botsInSector, sectorsFromBots } from '../hooks/useBots.js';
import { useAlerts } from '../hooks/useAlerts.js';
import SectorSelect from '../components/SectorSelect.jsx';
import BotCard from '../components/BotCard.jsx';
import AlertRow from '../components/AlertRow.jsx';

const THRESH = { battery: 20, waste: 85 };

export default function Dashboard() {
  const bots = useBots();
  const alerts = useAlerts();
  const sectors = useMemo(() => sectorsFromBots(bots), [bots]);
  const [sector, setSector] = useState('');
  const activeSector = sector || sectors[0] || '';
  const sectorBots = botsInSector(bots, activeSector);

  const pill = () => {
    if (sectorBots.some((b) => !b.connected))
      return { text: 'Attention needed', color: '#E4614C' };
    if (sectorBots.some((b) => b.battery < THRESH.battery || b.waste > THRESH.waste))
      return { text: 'Needs attention', color: '#E8A33D' };
    return { text: 'All operational', color: '#7FB069' };
  };
  const status = pill();

  const sectorAlerts = alerts
    .filter((a) => bots.find((b) => b.id === a.botId)?.sector === activeSector)
    .slice(0, 4);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted">Live telemetry from the collection bot fleet</p>
        </div>
        <div className="flex items-center gap-2.5">
          {sectors.length > 0 && (
            <SectorSelect sectors={sectors} value={activeSector} onChange={setSector} bots={bots} />
          )}
          <span
            className="flex items-center gap-1.5 text-xs font-semibold bg-surface2 rounded-full px-3 py-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
            {status.text}
          </span>
        </div>
      </div>

      {bots.length === 0 ? (
        <div className="text-center text-muted text-sm py-16">
          No bot data yet. Run the backend simulator (see README) or connect real bots writing
          to <code>/bots</code> in Firebase.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
            {sectorBots.map((b) => (
              <BotCard key={b.id} bot={b} />
            ))}
          </div>
          <div className="bg-surface border border-line rounded-xl p-4.5">
            <h3 className="text-sm font-bold mb-3">Recent alerts — this sector</h3>
            {sectorAlerts.length ? (
              sectorAlerts.map((a) => <AlertRow key={a.id} alert={a} />)
            ) : (
              <div className="text-center text-muted text-sm py-8">
                No alerts in this sector — all clear.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
