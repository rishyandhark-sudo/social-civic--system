import { useRef, useState } from 'react';

const MAX_FILES = 5;

export default function MediaUploader({ files, onChange }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function addFiles(newFiles) {
    const combined = [...files, ...Array.from(newFiles)].slice(0, MAX_FILES);
    onChange(combined);
  }

  function removeFile(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragOver ? 'border-primary bg-primary-light' : 'border-border bg-white'
        }`}
      >
        <p className="text-sm text-ink">
          <span className="font-medium text-primary">Choose photos or video</span> or drag them here
        </p>
        <p className="mt-1 text-xs text-ink/50">Up to {MAX_FILES} files, images or video</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {files.map((file, i) => (
            <li key={i} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white">
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Attachment ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-ink/50">Video</div>
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Remove attachment ${i + 1}`}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-xs text-white hover:bg-ink"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
