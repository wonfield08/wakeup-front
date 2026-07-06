import { NavLink } from 'react-router-dom';
import { Eye, BarChart2, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Eye, label: '실시간 감지' },
  { to: '/stats', icon: BarChart2, label: '기기·통계' },
  { to: '/settings', icon: Settings, label: '설정' },
];

export function Sidebar() {
  return (
    <aside className="w-[180px] min-h-screen bg-white border-r border-gray-200 flex flex-col py-4 shrink-0">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">WakeLens</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
          집중 모니터링 서비스
        </p>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
            이
          </div>
          <div>
            <p className="text-xs font-medium text-gray-800">이안</p>
            <p className="text-[10px] text-gray-400">AI 도우미</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
