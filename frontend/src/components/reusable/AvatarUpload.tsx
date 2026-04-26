import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { compressImage } from "@/utils/compressImage";
import toast from "react-hot-toast";

interface AvatarUploadProps {
  onChange?: (file: File | null) => void;
  className?: string;
  maxSizeKB?: number;
}

export function AvatarUpload({ onChange, className, maxSizeKB = 300 }: AvatarUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const selectedFile = newFiles[0];
    const originalSizeKB = selectedFile.size / 1024;

    // If already small enough, use directly
    if (originalSizeKB <= maxSizeKB) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      onChange?.(selectedFile);
      return;
    }

    // Compress
    setIsCompressing(true);
    const toastId = toast.loading("Compression de l'image...");
    try {
      const compressedFile = await compressImage(selectedFile, maxSizeKB);
      const compressedSizeKB = compressedFile.size / 1024;

      setFile(compressedFile);
      setPreview(URL.createObjectURL(compressedFile));
      onChange?.(compressedFile);

      toast.success(
        `Image compressée : ${originalSizeKB.toFixed(0)} Ko → ${compressedSizeKB.toFixed(0)} Ko`,
        { id: toastId }
      );
    } catch {
      toast.error("Erreur lors de la compression de l'image", { id: toastId });
      // Fallback: use original
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      onChange?.(selectedFile);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    onChange?.(null);
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    onDrop: handleFileChange,
  });

  const fileSizeKB = file ? file.size / 1024 : 0;
  const isUnderLimit = fileSizeKB <= maxSizeKB;

  return (
    <div className={cn("w-full", className)} {...getRootProps()}>
      <motion.div
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        className={cn(
          "relative w-full cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border/50 hover:border-primary/40 bg-muted/10",
          preview && "border-solid border-border/30"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />

        {isCompressing ? (
          // Compression loading state
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-1">
              <Loader2 size={24} className="text-primary animate-spin" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Compression en cours...
            </p>
            <p className="text-xs text-muted-foreground">
              Optimisation pour un chargement rapide
            </p>
          </div>
        ) : preview ? (
          // Preview mode
          <div className="relative">
            <img
              src={preview}
              alt="Aperçu de l'avatar"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center group">
              <button
                onClick={handleRemove}
                className="w-10 h-10 bg-background/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X size={16} className="text-destructive" />
              </button>
            </div>
            {file && (
              <div className="px-4 py-3 bg-background flex items-center justify-between">
                <p className="text-xs font-medium text-foreground truncate max-w-[70%]">
                  {file.name}
                </p>
                <p className={cn(
                  "text-[10px] uppercase tracking-wider font-bold",
                  isUnderLimit ? "text-emerald-500" : "text-amber-500"
                )}>
                  {fileSizeKB >= 1024
                    ? `${(fileSizeKB / 1024).toFixed(2)} MB`
                    : `${fileSizeKB.toFixed(0)} Ko`
                  }
                  {isUnderLimit && " ✓"}
                </p>
              </div>
            )}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-muted/40 flex items-center justify-center mb-1">
              {isDragActive ? (
                <Upload size={24} className="text-primary animate-bounce" />
              ) : (
                <ImageIcon size={24} className="text-muted-foreground/60" />
              )}
            </div>
            <p className="text-sm font-semibold text-foreground">
              {isDragActive ? "Déposez votre image" : "Photo de profil"}
            </p>
            <p className="text-xs text-muted-foreground">
              Glissez-déposez ou cliquez pour choisir (PNG, JPG, WebP)
            </p>
            <p className="text-[10px] text-muted-foreground/50 font-medium">
              Compression auto · max {maxSizeKB} Ko
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
