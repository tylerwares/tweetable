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
        'flex h-full flex-col justify-between rounded-lg border border-slate-800 bg-slate-950/90 p-4 shadow-sm transition hover:border-brand',
        variant === 'thread' && 'border-slate-700'
      )}
    >
      <p className="whitespace-pre-wrap text-sm text-slate-100">{content}</p>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-slate-700"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        {onSave && (
          <button
            type="button"
            onClick={() => onSave(content)}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-brand hover:text-white"
          >
            Save
          </button>
        )}
      </div>
    </article>
  );
};

export default DraftCard;
