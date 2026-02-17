import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, File } from "lucide-react";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File; // Store the original file object
  file_url?: string; // Store the remote URL if uploaded
}

interface FileUploadZoneProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

export function FileUploadZone({ files, onFilesChange }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file, // Keep the file!
    }));
    onFilesChange([...files, ...uploadedFiles]);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) {
      return FileText;
    }
    return File;
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all duration-300",
          "flex min-h-[200px] flex-col items-center justify-center text-center",
          isDragOver
            ? "scale-[1.02] border-primary bg-primary/5"
            : "border-border/50 hover:border-primary/50 hover:bg-card/50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.md"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div
          className={cn(
            "mb-4 rounded-2xl p-4 transition-all",
            isDragOver ? "scale-110 bg-primary/20" : "bg-secondary",
          )}
        >
          <Upload
            className={cn(
              "h-8 w-8 transition-colors",
              isDragOver ? "text-primary" : "text-muted-foreground",
            )}
          />
        </div>
        <h3 className="mb-1 text-lg font-semibold">
          {isDragOver ? "Drop files here" : "Upload your content"}
        </h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Drag and drop PDFs, slides, notebooks, or documents to generate video content
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["PDF", "PPTX", "DOCX", "TXT", "MD"].map((ext) => (
            <span
              key={ext}
              className="rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground"
            >
              .{ext.toLowerCase()}
            </span>
          ))}
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const Icon = getFileIcon(file.type);
            return (
              <div
                key={file.id}
                className="glass flex animate-fade-in items-center gap-3 rounded-xl p-3"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
