import { useState } from 'react';
import clsx from 'clsx';

export interface EditableTweetProps {
  label?: string;
  initialText: string;
  onChange?: (text: string) => void;
  onRegenerate?: () => void;
}

const EditableTweet = ({ label, initialText, onChange, onRegenerate }: EditableTweetProps) => {
  const [text, setText] = useState(initialText);
  const charCount = text.length;
  const warn = charCount >= 270;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleChange = (value: string) => {
    setText(value);
    onChange?.(value);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      {label && <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>}
      <textarea
        className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-sm text-slate-900 focus:border-[#1d9bf0] focus:outline-none"
        rows={3}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
      />
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span className={clsx(warn && 'text-amber-500')}>{charCount} chars {warn && '(270+ approaching limit)'}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-[#1d9bf0]"
          >
            Copy
          </button>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="rounded-md border border-[#1d9bf0]/60 bg-[#1d9bf0]/10 px-3 py-1 text-xs font-semibold text-[#0b4778] hover:border-[#1d9bf0]"
            >
              Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditableTweet;
