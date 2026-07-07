import { Camera, Clock, Bell } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getPostposition } from '@/utils/korean';

export function DetectionCards() {
  const threshold = useStore((s) => s.settings.detection.eyeClosureThreshold);
  const wakeupCharacterName = useStore((s) => s.wakeupCharacterName);

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
      title: `${wakeupCharacterName}${getPostposition(wakeupCharacterName, '이/가')} 깨움`,
      description: '영상·음성 재생',
      color: 'text-purple-500 bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map(({ icon: Icon, title, description, color }) => (
        <div key={title} className="bg-white rounded-[14px] p-5 border border-gray-100 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-base font-bold text-gray-800 mb-2">{title}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      ))}
    </div>
  );
}
