import { useState, useEffect } from 'react';
import { messaging, requestNotificationPermission } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Prompt = ({ onClose }) => (
  <div className="fixed bottom-4 right-4 z-[300] bg-[#1A1A1A] border border-white/10 p-4 max-w-xs shadow-lg">
    <p className="text-xs text-white/80 mb-3">Get notified about order updates and new arrivals.</p>
    <div className="flex gap-2">
      <button onClick={onClose} className="flex-1 py-2 border border-white/20 text-white/60 text-[10px] uppercase tracking-widest hover:text-white transition-colors">Later</button>
      <button onClick={async () => {
        await requestNotificationPermission();
        onClose();
      }} className="flex-1 py-2 bg-[#C5A880] text-black text-[10px] uppercase tracking-widest font-semibold">Enable</button>
    </div>
  </div>
);

const PushNotificationPrompt = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user || !messaging || !('Notification' in window)) return;
    const dismissed = localStorage.getItem('push_prompt_dismissed');
    if (!dismissed && Notification.permission === 'default') {
      const timer = setTimeout(() => setShow(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (!show) return null;

  return <Prompt onClose={() => { setShow(false); localStorage.setItem('push_prompt_dismissed', '1'); }} />;
};

export default PushNotificationPrompt;
