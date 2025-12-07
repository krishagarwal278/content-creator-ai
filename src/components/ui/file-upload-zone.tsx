import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, File } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
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
    }));
    onFilesChange([...files, ...uploadedFiles]);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return FileText;
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
          "flex flex-col items-center justify-center text-center min-h-[200px]",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border/50 hover:border-primary/50 hover:bg-card/50"
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
            "p-4 rounded-2xl mb-4 transition-all",
            isDragOver ? "bg-primary/20 scale-110" : "bg-secondary"
          )}
        >
          <Upload
            className={cn(
              "h-8 w-8 transition-colors",
              isDragOver ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>
        <h3 className="font-semibold text-lg mb-1">
          {isDragOver ? "Drop files here" : "Upload your content"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Drag and drop PDFs, slides, notebooks, or documents to generate video
          content
        </p>
        <div className="flex gap-2 mt-4 flex-wrap justify-center">
          {["PDF", "PPTX", "DOCX", "TXT", "MD"].map((ext) => (
            <span
              key={ext}
              className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground"
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
                className="glass flex items-center gap-3 p-3 rounded-xl animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
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
