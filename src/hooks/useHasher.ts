import { useCallback, useState } from 'react';
import { logToTerminal } from '../utils/log';

export const useHasher = () => {
  const [isHashing, setIsHashing] = useState(false);

  const applyDigitalDust = useCallback(async (blob: Blob): Promise<Blob> => {
    setIsHashing(true);
    logToTerminal('INITIATING DIGITAL DUST PROTOCOL...');

    try {
      // Use createImageBitmap for efficient decoding
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const totalPixels = data.length / 4;
      const pixelsToAlter = Math.floor(totalPixels * 0.01);

      logToTerminal(`TARGETING ${pixelsToAlter} PIXELS FOR NOISE INJECTION...`);

      // Alter ~1% of pixels
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < 0.01) {
          // Randomly choose a channel (R=0, G=1, B=2) - Ignore Alpha (3)
          const channel = Math.floor(Math.random() * 3);
          const value = data[i + channel];

          // Add +1 or -1, ensuring we stay in 0-255 range
          const noise = Math.random() < 0.5 ? -1 : 1;
          const newValue = Math.max(0, Math.min(255, value + noise));

          data[i + channel] = newValue;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      logToTerminal('NOISE INJECTION COMPLETE. RE-ENCODING...');

      // Re-encode with high quality to preserve visual fidelity while changing hash
      const newBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Canvas to Blob failed'));
          },
          blob.type,
          0.95 // High quality for JPEG/WebP
        );
      });

      logToTerminal('HASH BROKEN SUCCESSFULLY.');
      setIsHashing(false);
      return newBlob;

    } catch (error) {
      console.error(error);
      logToTerminal('DIGITAL DUST FAILED.');
      setIsHashing(false);
      throw error;
    }
  }, []);

  return { applyDigitalDust, isHashing };
};
