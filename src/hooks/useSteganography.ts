import { useState, useCallback } from 'react';
import { logToTerminal } from '../utils/log';

type SteganographyStatus = 'idle' | 'processing' | 'done' | 'error';

interface SteganographyResult {
  imageUrl: string;
  filename: string;
  originalSize: number;
  processedSize: number;
  bytesInjected: number;
}

interface ExtractionResult {
  secretText: string;
  bytesExtracted: number;
}

export const useSteganography = () => {
  const [hideStatus, setHideStatus] = useState<SteganographyStatus>('idle');
  const [extractStatus, setExtractStatus] = useState<SteganographyStatus>('idle');
  const [hideResult, setHideResult] = useState<SteganographyResult | null>(null);
  const [extractResult, setExtractResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Convert text to binary string
   */
  const textToBinary = (text: string): string => {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');
  };

  /**
   * Convert binary string to text
   */
  const binaryToText = (binary: string): string => {
    const bytes = binary.match(/.{8}/g) || [];
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
  };

  /**
   * Hide text in image using LSB steganography
   */
  const hideText = useCallback(async (imageFile: File, secretText: string): Promise<SteganographyResult> => {
    setHideStatus('processing');
    setError(null);
    logToTerminal('INITIATING LSB STEGANOGRAPHY SEQUENCE...');

    try {
      // Create image bitmap from file
      const bitmap = await createImageBitmap(imageFile);
      logToTerminal(`IMAGE LOADED: ${bitmap.width}x${bitmap.height} PIXELS`);

      // Create off-screen canvas
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Draw image to canvas
      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Add null terminator to secret text
      const textWithTerminator = secretText + '\0';
      const binary = textToBinary(textWithTerminator);
      const totalBits = binary.length;
      const totalBytes = Math.ceil(totalBits / 8);

      logToTerminal(`SECRET TEXT: ${secretText.length} CHARACTERS`);
      logToTerminal(`BINARY PAYLOAD: ${totalBits} BITS (${totalBytes} BYTES)`);

      // Check if image has enough capacity
      const maxCapacity = Math.floor((data.length / 4) * 3 / 8); // RGB channels only, 1 bit per channel
      if (totalBytes > maxCapacity) {
        throw new Error(`Image too small. Need ${totalBytes} bytes, have ${maxCapacity} bytes capacity`);
      }

      logToTerminal(`INJECTING ${totalBytes} BYTES INTO LSB LAYER...`);

      // Inject binary data into LSB of RGB channels
      let bitIndex = 0;
      for (let i = 0; i < data.length && bitIndex < totalBits; i += 4) {
        // Process R, G, B channels (skip Alpha)
        for (let channel = 0; channel < 3 && bitIndex < totalBits; channel++) {
          const bit = parseInt(binary[bitIndex], 10);
          // Clear LSB and set to our bit
          data[i + channel] = (data[i + channel] & 0xFE) | bit;
          bitIndex++;
        }
      }

      logToTerminal(`LSB INJECTION COMPLETE: ${bitIndex} BITS EMBEDDED`);

      // Put modified image data back
      ctx.putImageData(imageData, 0, 0);

      // Export as PNG (lossless)
      logToTerminal('ENCODING TO LOSSLESS PNG FORMAT...');
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          },
          'image/png',
          1.0
        );
      });

      const imageUrl = URL.createObjectURL(blob);
      const filename = imageFile.name.replace(/\.[^.]+$/, '_stego.png');

      const result: SteganographyResult = {
        imageUrl,
        filename,
        originalSize: imageFile.size,
        processedSize: blob.size,
        bytesInjected: totalBytes,
      };

      setHideResult(result);
      setHideStatus('done');
      logToTerminal('STEGANOGRAPHY SEQUENCE COMPLETE.');
      logToTerminal('ARTIFACT SECURED WITH HIDDEN PAYLOAD.');

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logToTerminal(`ERROR: ${message}`);
      setError(message);
      setHideStatus('error');
      throw err;
    }
  }, []);

  /**
   * Extract hidden text from image using LSB steganography
   */
  const extractText = useCallback(async (imageFile: File): Promise<ExtractionResult> => {
    setExtractStatus('processing');
    setError(null);
    logToTerminal('INITIATING LSB EXTRACTION SEQUENCE...');

    try {
      // Create image bitmap from file
      const bitmap = await createImageBitmap(imageFile);
      logToTerminal(`IMAGE LOADED: ${bitmap.width}x${bitmap.height} PIXELS`);

      // Create off-screen canvas
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Draw image to canvas
      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      logToTerminal('READING LSB LAYER FROM RGB CHANNELS...');

      // Extract LSBs from RGB channels
      let binary = '';
      let text = '';
      let byteBuffer = '';

      for (let i = 0; i < data.length; i += 4) {
        // Process R, G, B channels (skip Alpha)
        for (let channel = 0; channel < 3; channel++) {
          const lsb = (data[i + channel] & 1).toString();
          byteBuffer += lsb;

          // When we have a full byte
          if (byteBuffer.length === 8) {
            const byte = parseInt(byteBuffer, 2);
            binary += byteBuffer;
            byteBuffer = '';

            // Check for null terminator
            if (byte === 0) {
              logToTerminal(`EXTRACTED ${binary.length / 8} BYTES FROM LSB LAYER`);
              logToTerminal('NULL TERMINATOR DETECTED. EXTRACTION COMPLETE.');

              const result: ExtractionResult = {
                secretText: text,
                bytesExtracted: binary.length / 8,
              };

              setExtractResult(result);
              setExtractStatus('done');

              if (text.length === 0) {
                logToTerminal('WARNING: NO HIDDEN TEXT DETECTED IN IMAGE.');
              } else {
                logToTerminal(`SECRET TEXT RECOVERED: ${text.length} CHARACTERS`);
              }

              return result;
            }

            // Add character to text
            text += String.fromCharCode(byte);
          }
        }
      }

      // If we reach here, no null terminator was found
      logToTerminal('WARNING: NO NULL TERMINATOR FOUND.');
      logToTerminal(`EXTRACTED ${binary.length / 8} BYTES (POSSIBLY INCOMPLETE)`);

      const result: ExtractionResult = {
        secretText: text || 'No hidden text detected',
        bytesExtracted: binary.length / 8,
      };

      setExtractResult(result);
      setExtractStatus('done');

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logToTerminal(`ERROR: ${message}`);
      setError(message);
      setExtractStatus('error');
      throw err;
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setHideStatus('idle');
    setExtractStatus('idle');
    setHideResult(null);
    setExtractResult(null);
    setError(null);
  }, []);

  return {
    hideStatus,
    extractStatus,
    hideResult,
    extractResult,
    error,
    hideText,
    extractText,
    reset,
  };
};
