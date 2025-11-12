import { ChangeEvent, ClipboardEvent, DragEvent, useState } from 'react';

type UploadZoneProps = {
  onUpload?: (payload: { file?: File; text?: string }) => void;
};

const ACCEPTED_TYPES = ['text/plain', 'text/markdown'];
const ACCEPTED_EXTENSIONS = ['.txt', '.md'];
const MAX_BYTES = 50 * 1024;

const UploadZone = ({ onUpload }: UploadZoneProps) => {
  const [status, setStatus] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const isAcceptedType = ACCEPTED_TYPES.includes(file.type);
    const hasAcceptedExtension = ACCEPTED_EXTENSIONS.some((extension) =>
      file.name.toLowerCase().endsWith(extension)
    );
    if (!isAcceptedType && !hasAcceptedExtension) {
      setStatus('Only .txt or .md files are supported.');
      return;
    }

    if (file.size > MAX_BYTES) {
      setStatus('Files must be smaller than 50 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : undefined;
      setStatus(`Ready to upload ${file.name}`);
      onUpload?.({ file, text });
    };
    reader.onerror = () => {
      setStatus('Failed to read file contents.');
    };

    reader.readAsText(file);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const [file] = Array.from(event.dataTransfer.files);
    if (file) {
      handleFile(file);
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);
    if (file) {
      handleFile(file);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const text = event.clipboardData.getData('text');
    if (!text) {
      return;
    }
    if (new Blob([text]).size > MAX_BYTES) {
      setStatus('Pasted text must be smaller than 50 KB.');
      return;
    }
    setStatus(`Captured ${text.length} characters from clipboard.`);
    onUpload?.({ text });
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/80 p-6">
      <label
        htmlFor="upload"
        onDrop={onDrop}
        onDragOver={(event) => event.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 px-6 py-10 text-center transition hover:border-brand hover:bg-slate-900"
      >
        <span className="text-lg font-semibold text-slate-200">Upload or drop your notes</span>
        <span className="mt-2 text-sm text-slate-400">Supports .txt or .md up to 50 KB</span>
        <input id="upload" name="note-file" type="file" accept=".txt,.md" className="hidden" onChange={onChange} />
      </label>

      <textarea
        id="note-text"
        name="note-text"
        className="w-full rounded-md border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand focus:outline-none"
        placeholder="Or paste your notes here..."
        rows={4}
        onPaste={onPaste}
      />

      {status && <p className="text-sm text-slate-400">{status}</p>}
    </div>
  );
};

export default UploadZone;
