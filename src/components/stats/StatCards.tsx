interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ label, value, sub, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
      {trend && (
        <p className={`text-xs mt-1 font-medium ${trendUp ? 'text-green-500' : 'text-amber-500'}`}>
          {trend}
        </p>
      )}
    </div>
  );
}

interface StatCardsProps {
  todayCount: number;
  totalCount: number;
  avgBlink: number;
  focusRate: number;
}

export function StatCards({ todayCount, totalCount, avgBlink, focusRate }: StatCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <StatCard
        label="오늘 / 전체 졸음"
        value={`${todayCount}회/${totalCount}회`}
        sub="총 기록"
        trend={todayCount <= totalCount / 7 ? '▼ 평균 이하' : '▲ 평균 이상'}
        trendUp={todayCount <= totalCount / 7}
      />
      <StatCard
        label="평균 감음 횟수"
        value={`${todayCount}회`}
        sub="오늘 기준"
      />
      <StatCard
        label="평균 감음 시간"
        value={`${avgBlink.toFixed(1)}s`}
        sub="눈 감음 지속"
      />
      <StatCard
        label="집중도"
        value={`${focusRate}%`}
        sub="오늘 전체 시간"
        trend="▲ 8% 상승"
        trendUp
      />
    </div>
  );
}
