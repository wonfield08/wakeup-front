import { useStore } from '@/store/useStore';
import { StatCards } from '@/components/stats/StatCards';
import { DrowsinessChart } from '@/components/stats/DrowsinessChart';
import { AlertTriangle } from 'lucide-react';

export function Statistics() {
  const history = useStore((s) => s.history);

  const today = new Date().toDateString();
  const todayEvents = history.filter(
    (e) => new Date(e.timestamp).toDateString() === today
  );

  const avgBlink =
    history.length > 0
      ? history.reduce((sum, e) => sum + e.duration, 0) / history.length
      : 0;

  const focusRate = Math.max(0, Math.min(100, 100 - todayEvents.length * 2));

  const formattedDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">기록 · 통계</h1>
          <p className="text-xs text-gray-400 mt-0.5">집중도 패턴과 졸음 기록을 분석합니다</p>
        </div>
        <span className="text-sm text-gray-400">{formattedDate}</span>
      </div>

      <div className="flex flex-col gap-4">
        <StatCards
          todayCount={todayEvents.length}
          totalCount={history.length}
          avgBlink={avgBlink}
          focusRate={focusRate}
        />

        <div className="grid grid-cols-[1fr_280px] gap-4">
          <DrowsinessChart />

          {/* Recent records */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-4">최근 깨우기 기록</p>
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">기록이 없습니다</p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.slice(0, 8).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      e.type === 'asleep' ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      <AlertTriangle className={`w-3 h-3 ${
                        e.type === 'asleep' ? 'text-red-500' : 'text-amber-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 font-medium">
                        {e.type === 'asleep' ? '깊은 졸음' : '졸음 감지'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(e.timestamp).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">{e.duration.toFixed(1)}s</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
