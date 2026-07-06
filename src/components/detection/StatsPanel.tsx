import { useTimer } from '@/hooks/useTimer';
import { useStore } from '@/store/useStore';

export function StatsPanel() {
  const session = useStore((s) => s.session);
  const triggerWakeup = useStore((s) => s.triggerWakeup);
  const { formatted } = useTimer(session.isActive);

  const { blinkCount, avgBlinkDuration, drowsinessEvents } = session.currentStats;
  const recentEvents = drowsinessEvents.slice(-3).reverse();

  return (
    <div className="flex flex-col gap-3">
      {/* Timer */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <p className="text-xs text-gray-400 mb-1">집중 시간</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900 tabular-nums">{formatted}</span>
          <span className="text-sm text-gray-400">초</span>
        </div>
        <div className="flex gap-4 mt-3">
          <div>
            <p className="text-xs text-gray-400">눈 감음</p>
            <p className="text-lg font-semibold text-gray-800">{blinkCount}회</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">평균 감음 시간</p>
            <p className="text-lg font-semibold text-gray-800">{avgBlinkDuration.toFixed(1)}s</p>
          </div>
        </div>
      </div>

      {/* Pattern history */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 flex-1">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500">패턴 기록</p>
          {recentEvents.length > 0 && (
            <span className="text-[10px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
              졸음 감지
            </span>
          )}
        </div>
        {recentEvents.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">이상 없음</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentEvents.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {new Date(e.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-amber-600 font-medium">{e.duration.toFixed(1)}s</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview button */}
      <button
        onClick={() => triggerWakeup()}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
      >
        깨우기 화면 미리보기
      </button>
    </div>
  );
}
