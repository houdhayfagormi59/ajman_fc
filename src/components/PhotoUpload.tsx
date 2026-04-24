'use client';
import { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';

interface PhotoUploadProps {
  onFile: (file: File) => void;
  onBase64?: (base64: string) => void;
  preview?: string;
  onClear?: () => void;
  label?: string;
}

export default function PhotoUpload({ onFile, onBase64, preview, onClear, label = 'Photo' }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(preview || null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File too large (max 5MB)'); return; }
    onFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLocalPreview(result);
      onBase64?.(result);
    };
    reader.readAsDataURL(file);
  }

  function handleClear() {
    setLocalPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClear?.();
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="label">{label}</label>
      <div className="border-2 border-dashed rounded-xl p-4 text-center transition cursor-pointer hover:border-brand-400"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-soft)' }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {localPreview ? (
          <div className="relative inline-block">
            <img src={localPreview} alt="preview" className="w-24 h-24 rounded-xl object-cover mx-auto" />
            {onClear && (
              <button type="button" onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
                <X size={12} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-2">
            <Camera size={24} className="text-brand-600" />
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Click to upload</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>JPG, PNG (max 5MB)</div>
          </div>
        )}
      </div>
    </div>
  );
}
