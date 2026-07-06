import { useStore } from '@/store/useStore';
import { Toggle } from '@/components/ui/Toggle';
import { Slider } from '@/components/ui/Slider';
import type { Settings as SettingsType } from '@/types';
import { Save, Trash2 } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <p className="text-sm font-semibold text-gray-700 mb-4">{title}</p>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function Settings() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const clearHistory = useStore((s) => s.clearHistory);

  const update = <K extends keyof SettingsType>(
    section: K,
    key: keyof SettingsType[K],
    value: unknown
  ) => {
    updateSettings({
      [section]: { ...settings[section], [key]: value },
    } as Partial<SettingsType>);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">설정</h1>
          <p className="text-xs text-gray-400 mt-0.5">감지 및 깨우기 동작을 설정합니다</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
          <Save className="w-4 h-4" />
          설정 저장
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Detection settings */}
        <Section title="감지 설정">
          <Row label="눈 감음 기준 시간" sub="이 시간 이상 눈을 감으면 깨워줍니다">
            <div className="w-40">
              <Slider
                min={1}
                max={10}
                step={0.5}
                value={settings.detection.eyeClosureThreshold}
                onChange={(v) => update('detection', 'eyeClosureThreshold', v)}
              />
            </div>
          </Row>
          <Row label="감지 모드">
            <div className="flex gap-1.5">
              {(['fast', 'normal', 'slow'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => update('detection', 'detectionMode', mode)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                    settings.detection.detectionMode === mode
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {mode === 'fast' ? '1초' : mode === 'normal' ? '보통' : '3초'}
                </button>
              ))}
            </div>
          </Row>
          <Row label="카메라">
            <select
              value={settings.detection.cameraId}
              onChange={(e) => update('detection', 'cameraId', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">기본 · FaceTime HD</option>
            </select>
          </Row>
        </Section>

        {/* Wakeup settings */}
        <Section title="깨우기 설정">
          <Row label="알림 세기" sub={`${settings.wakeup.volume}%`}>
            <div className="w-40">
              <Slider
                min={0}
                max={100}
                step={5}
                value={settings.wakeup.volume}
                onChange={(v) => update('wakeup', 'volume', v)}
              />
            </div>
          </Row>
          <Row label="깨우기 볼륨 부스트">
            <Toggle
              checked={settings.wakeup.enableVolumeBoost}
              onChange={(v) => update('wakeup', 'enableVolumeBoost', v)}
            />
          </Row>
          <Row label="깊은 취침 제외">
            <Toggle
              checked={settings.wakeup.enableDeepSleepExclusion}
              onChange={(v) => update('wakeup', 'enableDeepSleepExclusion', v)}
            />
          </Row>
        </Section>

        {/* Notifications */}
        <Section title="알림">
          <Row label="졸음 감지 알림">
            <Toggle
              checked={settings.notifications.drowsinessAlert}
              onChange={(v) => update('notifications', 'drowsinessAlert', v)}
            />
          </Row>
          <Row label="일일 집중 리포트">
            <Toggle
              checked={settings.notifications.dailyReport}
              onChange={(v) => update('notifications', 'dailyReport', v)}
            />
          </Row>
        </Section>

        {/* AI settings */}
        <Section title="AI 제한">
          <Row label="데이터 수집" sub="모델 개선에 활용됩니다">
            <Toggle
              checked={settings.ai.dataCollection}
              onChange={(v) => update('ai', 'dataCollection', v)}
            />
          </Row>
          <Row label="기록 보관 기간">
            <select
              value={settings.ai.historyRetentionDays}
              onChange={(e) => update('ai', 'historyRetentionDays', Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>최근 7일</option>
              <option value={30}>최근 30일</option>
              <option value={90}>최근 90일</option>
              <option value={365}>최근 1년</option>
            </select>
          </Row>
          <Row label="기록 전체 초기화">
            <button
              onClick={() => {
                if (confirm('모든 기록을 삭제하시겠어요?')) clearHistory();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              초기화
            </button>
          </Row>
        </Section>
      </div>
    </div>
  );
}
