interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
}

export function Slider({ min, max, step = 0.1, value, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, #3B82F6 ${pct}%, #E5E7EB ${pct}%)`,
        }}
      />
      <span className="text-sm font-medium text-gray-700 w-10 text-right">{value}</span>
    </div>
  );
}
