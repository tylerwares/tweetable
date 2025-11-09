import { ChangeEvent } from 'react';

export type Persona = 'builder' | 'educator' | 'crypto' | 'custom';

type PersonaSelectorProps = {
  persona: Persona;
  onPersonaChange?: (persona: Persona) => void;
  onImportBio?: (bio: string) => void;
};

const personas: Array<{ id: Persona; label: string }> = [
  { id: 'builder', label: 'Builder' },
  { id: 'educator', label: 'Educator' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'custom', label: 'Import from X bio' }
];

const PersonaSelector = ({ persona, onPersonaChange, onImportBio }: PersonaSelectorProps) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onPersonaChange?.(event.target.value as Persona);
  };

  return (
    <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/80 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Persona</h3>
        <span className="text-xs uppercase tracking-wide text-slate-500">Beta</span>
      </div>
      <p className="text-sm text-slate-400">
        Choose a voice for your generated drafts or import your existing X bio.
      </p>
      <select
        className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none"
        value={persona}
        onChange={handleChange}
      >
        {personas.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      {persona === 'custom' && (
        <textarea
          className="mt-3 w-full rounded-md border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand focus:outline-none"
          placeholder="Paste your X bio here..."
          rows={3}
          onBlur={(event) => onImportBio?.(event.target.value)}
        />
      )}
    </div>
  );
};

export default PersonaSelector;
