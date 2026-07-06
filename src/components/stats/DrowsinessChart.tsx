import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useStore } from '@/store/useStore';

export function DrowsinessChart() {
  const hourlyStats = useStore((s) => s.hourlyStats);

  const data = hourlyStats.map((s) => ({
    name: `${s.hour}시`,
    집중: s.focus,
    졸음: s.drowsy,
  }));

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <p className="text-sm font-medium text-gray-700 mb-4">시간대별 졸음 감지</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={2} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
          <Bar dataKey="집중" fill="#3B82F6" radius={[3, 3, 0, 0]} />
          <Bar dataKey="졸음" fill="#F59E0B" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
