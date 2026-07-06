import { NavLink } from 'react-router-dom';
import { Eye, BarChart2, Settings, Radio } from 'lucide-react';
import { useStore } from '@/store/useStore';

const navItems = [
  { to: '/', icon: Eye, label: '실시간 감지' },
  { to: '/stats', icon: BarChart2, label: '기록·통계' },
  { to: '/settings', icon: Settings, label: '설정' },
];

export function Sidebar() {
  const isActive = useStore((s) => s.session.isActive);
  const apiOnline = useStore((s) => s.apiOnline);

  return (
    <aside className="w-[200px] min-h-screen bg-white border-r border-gray-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">WakeLens</p>
            <p className="text-[10px] text-gray-400 leading-tight">AI 집중 모니터</p>
          </div>
        </div>
      </div>

      {/* API status */}
      {isActive && (
        <div className="mx-3 mb-3 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-2">
          <Radio className={`w-3 h-3 ${apiOnline ? 'text-green-500' : 'text-amber-400'} animate-pulse`} />
          <span className={`text-[10px] font-medium ${apiOnline ? 'text-green-600' : 'text-amber-500'}`}>
            {apiOnline ? 'API 연결됨' : 'API 오프라인'}
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="px-2">
        <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          모니터링
        </p>
        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
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
      </div>

      {/* Ian status */}
      <div className="mt-auto px-3 pb-5">
        <p className="px-2 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          깨움 담당
        </p>
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            이안
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">이안</p>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-[10px] text-gray-400">{isActive ? '감지 중' : '대기 중'}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
