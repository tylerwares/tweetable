import { useState } from 'react';
import clsx from 'clsx';

type DraftCardProps = {
  content: string;
  variant?: 'short' | 'long' | 'thread';
  onSave?: (content: string) => void;
};

const DraftCard = ({ content, variant = 'short', onSave }: DraftCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy draft', error);
    }
  };

  return (
    <article
      className={clsx(
        'flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#1d9bf0]',
        variant === 'thread' && 'border-slate-200'
      )}
    >
      <p className="whitespace-pre-wrap text-sm text-slate-900">{content}</p>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md bg-[#1d9bf0] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#1583ca]"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        {onSave && (
          <button
            type="button"
            onClick={() => onSave(content)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-[#1d9bf0] hover:text-[#1d9bf0]"
          >
            Save
          </button>
        )}
      </div>
    </article>
  );
};

export default DraftCard;
