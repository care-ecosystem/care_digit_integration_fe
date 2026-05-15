import { useRef, useState, useCallback } from "react";
import { UploadCloudIcon, XCircleIcon, ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18NNAMESPACE } from "@/lib/constants";
import { ALLOWED_IMAGE_TYPES } from "@/types/fileTypes";

export interface FilePreview {
  file: File;
  previewUrl: string;
}

interface FileUploadZoneProps {
  files: FilePreview[];
  onChange: (files: FilePreview[]) => void;
}

export function FileUploadZone({ files, onChange }: FileUploadZoneProps) {
  const { t } = useTranslation(I18NNAMESPACE);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);

      const validFiles: FilePreview[] = [];

      arr.forEach((file) => {
        // ✅ ONLY allow images
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
          console.warn(`${file.name} is not a valid image`);
          return;
        }

        validFiles.push({
          file,
          previewUrl: URL.createObjectURL(file),
        });
      });

      onChange([...files, ...validFiles]);
    },
    [files, onChange],
  );

  const removeFile = (index: number) => {
    URL.revokeObjectURL(files[index].previewUrl);
    onChange(files.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary-500 bg-primary-50"
            : "border-secondary-300 bg-secondary-50 hover:border-primary-400 hover:bg-primary-50/50"
        }`}
      >
        <UploadCloudIcon
          className={`size-8 ${isDragging ? "text-primary-500" : "text-secondary-400"}`}
        />
        <div>
          <p className="text-sm font-medium text-secondary-700">
            {t("drop_files_here")}{" "}
            <span className="text-primary-600 underline">{t("browse")}</span>
          </p>
          <p className="mt-0.5 text-xs text-secondary-400">
            {t("upload_hint")}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {files.map((fp, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-lg overflow-hidden border border-secondary-200 bg-secondary-100"
            >
              {fp.file.type.startsWith("image/") ? (
                <img
                  src={fp.previewUrl}
                  alt={fp.file.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1">
                  <ImageIcon className="size-6 text-secondary-400" />
                  <span className="line-clamp-2 text-center text-xs text-secondary-500 break-all">
                    {fp.file.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-red-500 opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-white"
                aria-label="Remove file"
              >
                <XCircleIcon className="size-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-secondary-900/80 px-1.5 py-1 text-xs text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 truncate">
                {fp.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
