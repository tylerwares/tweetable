import clsx from 'clsx';

export type ToneKey =
  | 'professional_casual'
  | 'polished_chaotic'
  | 'calm_enraged'
  | 'optimistic_cynical'
  | 'insightful_entertaining'
  | 'clean_profane';

export const TONE_LABELS: Record<ToneKey, { left: string; right: string; title: string }> = {
  professional_casual: { left: 'Professional', right: 'Casual', title: 'Professional ↔ Casual' },
  polished_chaotic: { left: 'Polished', right: 'Chaotic', title: 'Polished ↔ Chaotic' },
  calm_enraged: { left: 'Calm', right: 'Enraged', title: 'Calm ↔ Enraged' },
  optimistic_cynical: { left: 'Optimistic', right: 'Cynical', title: 'Optimistic ↔ Cynical' },
  insightful_entertaining: { left: 'Insightful', right: 'Entertaining', title: 'Insightful ↔ Entertaining' },
  clean_profane: { left: 'Clean', right: 'Profane', title: 'Clean ↔ Profane' }
};

export interface ToneSliderProps {
  toneKey: ToneKey;
  value: number;
  onChange: (key: ToneKey, value: number) => void;
}

const ToneSlider = ({ toneKey, value, onChange }: ToneSliderProps) => {
  const labels = TONE_LABELS[toneKey];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{labels.left}</span>
        <span className="font-semibold text-slate-200">{labels.title}</span>
        <span>{labels.right}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        className={clsx(
          'w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-brand',
          'h-2'
        )}
        onChange={(e) => onChange(toneKey, Number(e.target.value))}
      />
      <div className="text-right text-[11px] text-slate-400">{value}</div>
    </div>
  );
};

export default ToneSlider;
