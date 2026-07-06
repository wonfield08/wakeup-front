import { Camera, Clock, Bell } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function DetectionCards() {
  const threshold = useStore((s) => s.settings.detection.eyeClosureThreshold);

  const cards = [
    {
      icon: Camera,
      title: '얼굴 인식',
      description: '눈 위치를 실시간 추적',
      color: 'text-blue-500 bg-blue-50',
    },
    {
      icon: Clock,
      title: '졸음 판정',
      description: `${threshold}초 이상 감음 감지`,
      color: 'text-amber-500 bg-amber-50',
    },
    {
      icon: Bell,
      title: '이안이 깨움',
      description: '영상·음성 재생',
      color: 'text-purple-500 bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map(({ icon: Icon, title, description, color }) => (
        <div key={title} className="bg-white rounded-xl p-4 border border-gray-100">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-0.5">{title}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      ))}
    </div>
  );
}
