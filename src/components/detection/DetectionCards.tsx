import { Eye, AlertCircle, Mic } from 'lucide-react';

const cards = [
  {
    icon: Eye,
    title: '눈 감지',
    description: '실시간으로 눈의 개폐 상태를 감지하여 집중도를 측정합니다',
    color: 'text-blue-500 bg-blue-50',
  },
  {
    icon: AlertCircle,
    title: '졸음 탐지',
    description: '눈 감음 패턴을 분석해 졸음 징후를 사전에 탐지합니다',
    color: 'text-amber-500 bg-amber-50',
  },
  {
    icon: Mic,
    title: '이안만의 목소리',
    description: 'AI 이안이 개인화된 목소리로 부드럽게 깨워줍니다',
    color: 'text-purple-500 bg-purple-50',
  },
];

export function DetectionCards() {
  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      {cards.map(({ icon: Icon, title, description, color }) => (
        <div key={title} className="bg-white rounded-xl p-4 border border-gray-100">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium text-gray-800 mb-1">{title}</p>
          <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
        </div>
      ))}
      {/* Ian character card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          이안
        </div>
        <div className="bg-white rounded-lg px-3 py-1.5 text-xs text-gray-600 text-center shadow-sm">
          눈을 감으면 제가 깨워드릴게요!
        </div>
      </div>
    </div>
  );
}
