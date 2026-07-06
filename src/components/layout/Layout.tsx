import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useStore } from '@/store/useStore';
import { WakeupOverlay } from '@/components/wakeup/WakeupOverlay';

export function Layout() {
  const isWakeupVisible = useStore((s) => s.session.isWakeupScreenVisible);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      {isWakeupVisible && <WakeupOverlay />}
    </div>
  );
}
