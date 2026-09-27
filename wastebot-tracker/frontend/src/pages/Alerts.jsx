import { useAlerts } from '../hooks/useAlerts.js';
import AlertRow from '../components/AlertRow.jsx';

export default function Alerts() {
  const alerts = useAlerts();
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Alerts</h2>
        <p className="text-sm text-muted">Live conditions and history across the fleet</p>
      </div>
      <div className="bg-surface border border-line rounded-xl p-4.5">
        <h3 className="text-sm font-bold mb-3">Alert history</h3>
        {alerts.length ? (
          alerts.map((a) => <AlertRow key={a.id} alert={a} />)
        ) : (
          <div className="text-center text-muted text-sm py-8">No alerts recorded yet.</div>
        )}
      </div>
    </div>
  );
}
