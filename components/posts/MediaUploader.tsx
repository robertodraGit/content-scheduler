"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface MediaFile {
  file: File;
  preview: string;
  id: string;
}

interface MediaUploaderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

export function MediaUploader({
  onFilesChange,
  maxFiles = 10,
}: MediaUploaderProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles
        .slice(0, maxFiles - files.length)
        .map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          id: Math.random().toString(36).substring(7),
        }));

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles.map((f) => f.file));
    },
    [files, maxFiles, onFilesChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles,
    multiple: true,
  });

  const removeFile = (id: string) => {
    const updatedFiles = files.filter((f) => {
      if (f.id === id) {
        URL.revokeObjectURL(f.preview);
        return false;
      }
      return true;
    });
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map((f) => f.file));
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    const updatedFiles = [...files];
    const [moved] = updatedFiles.splice(fromIndex, 1);
    updatedFiles.splice(toIndex, 0, moved);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map((f) => f.file));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          {isDragActive
            ? "Rilascia le immagini qui"
            : "Trascina le immagini qui o clicca per selezionare"}
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, WEBP fino a {maxFiles} immagini
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((mediaFile, index) => (
            <Card key={mediaFile.id} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-t-lg">
                <img
                  src={mediaFile.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  #{index + 1}
                </span>
                <div className="flex gap-1">
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveFile(index, index - 1);
                      }}
                    >
                      ↑
                    </Button>
                  )}
                  {index < files.length - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveFile(index, index + 1);
                      }}
                    >
                      ↓
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(mediaFile.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
