/**
 * Compresses an image file using canvas.
 * Resizes to max dimension and compresses to target size.
 *
 * @param file - The image file to compress
 * @param maxSizeKB - Maximum file size in KB (default: 300)
 * @param maxDimension - Maximum width/height in px (default: 1200)
 * @returns A promise that resolves with compressed File object
 */
export function compressImage(
  file: File,
  maxSizeKB = 300,
  maxDimension = 1200
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        while (dataUrl.length * 0.75 > maxSizeKB * 1024 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        // Convert data URL to File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.\w+$/, ".jpg"),
              { type: "image/jpeg" }
            );
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Compresses an image file and returns a data URL string.
 * Used when you need a base64 string instead of a File object.
 */
export function compressImageToDataUrl(
  file: File,
  maxSizeKB = 300,
  maxDimension = 1200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        while (dataUrl.length * 0.75 > maxSizeKB * 1024 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
