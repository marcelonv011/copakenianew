import React, { useState, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/config";

export default function ImageUpload({
  value,
  onChange,
  className = "",
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const fileName = `${Date.now()}-${file.name}`;

      const storageRef = ref(
        storage,
        `uploads/${fileName}`
      );

      await uploadBytes(storageRef, file);

      const url = await getDownloadURL(
        storageRef
      );

      onChange(url);
    } catch (error) {
      console.error(
        "Error al subir imagen:",
        error
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt=""
            className="w-full h-40 object-cover rounded-lg"
          />

          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          disabled={uploading}
          className="w-full h-40 rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-2 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Subir imagen
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}