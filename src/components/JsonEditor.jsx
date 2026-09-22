import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Code, Check, AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';
import { cn } from '../lib/utils';

export function JsonEditor({
  value = '{}',
  onChange,
  onValidityChange,
  readOnly = false,
  label,
  height = 'h-96',
  className,
}) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (typeof value === 'object') {
        setText(JSON.stringify(value, null, 2));
      } else if (typeof value === 'string') {
        const parsed = JSON.parse(value);
        setText(JSON.stringify(parsed, null, 2));
      }
      setError(null);
      if (onValidityChange) onValidityChange(true);
    } catch {
      setText(value || '{}');
    }
  }, [value]);

  const handleChange = (newVal) => {
    setText(newVal);
    try {
      const parsed = JSON.parse(newVal);
      setError(null);
      if (onChange) onChange(parsed, newVal);
      if (onValidityChange) onValidityChange(true, parsed);
    } catch (err) {
      setError(err.message);
      if (onValidityChange) onValidityChange(false, null);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      setText(formatted);
      setError(null);
      if (onChange) onChange(parsed, formatted);
      if (onValidityChange) onValidityChange(true, parsed);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={cn('flex flex-col rounded border border-slate-200 bg-slate-900 overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-slate-300">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Code className="w-4 h-4 text-brand-gold-400" />
          <span>{label || 'JSON Schema & Layout Configuration'}</span>
        </div>

        <div className="flex items-center gap-2">
          {error ? (
            <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800">
              <AlertCircle className="w-3 h-3" />
              <span>Syntax Error</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">
              <Check className="w-3 h-3" />
              <span>Valid JSON</span>
            </span>
          )}

          {!readOnly && (
            <Button
              size="sm"
              variant="ghost"
              icon={RefreshCw}
              onClick={handleFormat}
              className="text-slate-300 hover:text-white hover:bg-slate-800 h-7 text-xs"
            >
              Format
            </Button>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className={cn('relative font-mono text-xs', height)}>
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          className="w-full h-full p-4 bg-slate-900 text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-slate-700"
        />
      </div>

      {/* Error message strip */}
      {error && (
        <div className="px-4 py-2 bg-rose-950 border-t border-rose-900 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}
    </div>
  );
}

export default JsonEditor;
