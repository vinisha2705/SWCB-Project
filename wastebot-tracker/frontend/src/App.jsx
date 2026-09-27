import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getToken, onMessage } from 'firebase/messaging';
import { useAuth } from './context/AuthContext.jsx';
import { getMessagingIfSupported } from './firebase.js';
import { api } from './api.js';
import Sidebar from './components/Sidebar.jsx';
import TabBar from './components/TabBar.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Alerts from './pages/Alerts.jsx';
import Analytics from './pages/Analytics.jsx';
import BotInfo from './pages/BotInfo.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

// Registers for push notifications and sends the FCM token to the backend
// so it can push alerts (e.g. "bot offline") even when the tab isn't open.
function useNotifications() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    (async () => {
      const messaging = await getMessagingIfSupported();
      if (!messaging) return;
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });
        if (token) await api.registerToken(token, user.uid);
        onMessage(messaging, (payload) => {
          console.log('Foreground push received:', payload);
        });
      } catch (err) {
        console.warn('Notifications not enabled:', err.message);
      }
    })();
  }, [user]);
}

export default function App() {
  const { user } = useAuth();
  useNotifications();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <Protected>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-5 md:p-7 pb-24 md:pb-7">
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="alerts" element={<Alerts />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="bot-info" element={<BotInfo />} />
                </Routes>
              </main>
              <TabBar />
            </div>
          </Protected>
        }
      />
    </Routes>
  );
}
