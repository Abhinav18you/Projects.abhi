import { useState, useCallback } from 'react';
import { logToTerminal } from '../utils/log';

type SteganalysisStatus = 'idle' | 'processing' | 'done' | 'error';

// Threshold for determining if anomaly is significant (percentage)
export const ANOMALY_THRESHOLD = 5;

interface SteganalysisResult {
  imageUrl: string;
  width: number;
  height: number;
  anomalyScore: number;
}

export const useSteganalysis = () => {
  const [status, setStatus] = useState<SteganalysisStatus>('idle');
  const [result, setResult] = useState<SteganalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * X-Ray Scanner: Visualize LSB bit-plane to detect hidden data
   */
  const scanImage = useCallback(async (imageFile: File): Promise<SteganalysisResult> => {
    setStatus('processing');
    setError(null);
    logToTerminal('INITIATING BIT-PLANE STEGANALYSIS...');

    try {
      // Create image bitmap from file
      const bitmap = await createImageBitmap(imageFile);
      logToTerminal(`IMAGE LOADED: ${bitmap.width}x${bitmap.height} PIXELS`);

      // Create off-screen canvas for source image
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = bitmap.width;
      sourceCanvas.height = bitmap.height;
      const sourceCtx = sourceCanvas.getContext('2d');

      if (!sourceCtx) {
        throw new Error('Failed to get source canvas context');
      }

      // Draw image to canvas
      sourceCtx.drawImage(bitmap, 0, 0);
      const sourceData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
      const data = sourceData.data;

      logToTerminal('EXTRACTING LSB BIT-PLANE FROM RGB CHANNELS...');

      // Create visualization canvas
      const visualCanvas = document.createElement('canvas');
      visualCanvas.width = sourceCanvas.width;
      visualCanvas.height = sourceCanvas.height;
      const visualCtx = visualCanvas.getContext('2d');

      if (!visualCtx) {
        throw new Error('Failed to get visualization canvas context');
      }

      const visualData = visualCtx.createImageData(visualCanvas.width, visualCanvas.height);
      const vData = visualData.data;

      // Extract LSB bit-plane and create black/white visualization
      let onesCount = 0;
      let zerosCount = 0;
      let pixelIndex = 0;

      for (let i = 0; i < data.length; i += 4) {
        // Average the LSBs of R, G, B channels for this pixel
        const rLsb = data[i] & 1;
        const gLsb = data[i + 1] & 1;
        const bLsb = data[i + 2] & 1;

        // Use the average LSB value for visualization
        const avgLsb = Math.round((rLsb + gLsb + bLsb) / 3);

        // Map: 0 → black (0), 1 → white (255)
        const value = avgLsb * 255;

        vData[i] = value;     // R
        vData[i + 1] = value; // G
        vData[i + 2] = value; // B
        vData[i + 3] = 255;   // A (fully opaque)

        // Track distribution
        if (avgLsb === 1) onesCount++;
        else zerosCount++;

        pixelIndex++;
      }

      logToTerminal(`BIT-PLANE EXTRACTED: ${pixelIndex} PIXELS ANALYZED`);
      logToTerminal(`DISTRIBUTION: ${onesCount} WHITE / ${zerosCount} BLACK`);

      // Calculate anomaly score (deviation from expected 50/50 distribution)
      const totalPixels = onesCount + zerosCount;
      const expectedOnes = totalPixels / 2;
      const deviation = Math.abs(onesCount - expectedOnes);
      const anomalyScore = (deviation / totalPixels) * 100;

      logToTerminal(`ANOMALY SCORE: ${anomalyScore.toFixed(2)}%`);

      if (anomalyScore >= ANOMALY_THRESHOLD) {
        logToTerminal('> VERDICT: ANOMALY DETECTED. HIDDEN DATA LIKELY.');
      } else {
        logToTerminal('> VERDICT: NO HIDDEN DATA FOUND.');
      }

      // Put visualization data on canvas
      visualCtx.putImageData(visualData, 0, 0);

      logToTerminal('RENDERING BIT-PLANE TOPOGRAPHY...');

      // Export visualization as data URL
      const imageUrl = visualCanvas.toDataURL('image/png');

      const scanResult: SteganalysisResult = {
        imageUrl,
        width: visualCanvas.width,
        height: visualCanvas.height,
        anomalyScore: Math.round(anomalyScore * 100) / 100,
      };

      setResult(scanResult);
      setStatus('done');
      logToTerminal('STEGANALYSIS COMPLETE.');

      return scanResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logToTerminal(`ERROR: ${message}`);
      setError(message);
      setStatus('error');
      throw err;
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    result,
    error,
    scanImage,
    reset,
  };
};
