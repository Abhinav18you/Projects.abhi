import { useCallback, useRef, useState } from 'react';
import { FilesetResolver, FaceDetector } from '@mediapipe/tasks-vision';
import { logToTerminal } from '../utils/log';

export type BlackoutStatus = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error';

export interface BlackoutResult {
  blob: Blob;
  fileName: string;
  facesDetected: number;
  originalSize: number;
  finalSize: number;
}

export const useBlackoutEngine = () => {
  const [status, setStatus] = useState<BlackoutStatus>('idle');
  const [result, setResult] = useState<BlackoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const faceDetectorRef = useRef<FaceDetector | null>(null);
  const isInitializedRef = useRef(false);

  const initializeDetector = useCallback(async () => {
    if (isInitializedRef.current && faceDetectorRef.current) {
      return faceDetectorRef.current;
    }

    try {
      setStatus('loading');
      logToTerminal('LOADING WEBASSEMBLY ML MODEL...');

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          delegate: 'GPU'
        },
        runningMode: 'IMAGE',
        minDetectionConfidence: 0.5
      });

      faceDetectorRef.current = faceDetector;
      isInitializedRef.current = true;
      setStatus('ready');
      logToTerminal('ML MODEL LOADED SUCCESSFULLY.');
      
      return faceDetector;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logToTerminal(`ERROR LOADING ML MODEL: ${errorMessage}`);
      setError(errorMessage);
      setStatus('error');
      throw err;
    }
  }, []);

  const applyGaussianBlur = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    blurAmount: number = 30
  ) => {
    // Save current context state
    ctx.save();
    
    // Create a temporary canvas for the face region
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      ctx.restore();
      return;
    }
    
    // Copy the face region to temp canvas
    tempCtx.drawImage(
      ctx.canvas,
      x, y, width, height,
      0, 0, width, height
    );
    
    // Apply multiple blur passes for heavy Gaussian effect
    ctx.filter = `blur(${blurAmount}px)`;
    
    // Clear the face region and redraw with blur
    ctx.clearRect(x, y, width, height);
    ctx.drawImage(tempCanvas, x, y, width, height);
    
    // Restore context
    ctx.restore();
  };

  const processImage = useCallback(async (file: File): Promise<BlackoutResult> => {
    try {
      setStatus('processing');
      setError(null);
      logToTerminal(`INITIATING BLACKOUT SEQUENCE FOR: ${file.name.toUpperCase()}`);
      logToTerminal(`SIZE: ${(file.size / 1024).toFixed(2)} KB | TYPE: ${file.type.toUpperCase()}`);

      // Initialize detector if not ready
      const detector = await initializeDetector();
      if (!detector) {
        throw new Error('Face detector not initialized');
      }

      // Create image element from file
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });

      // Create off-screen canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Detect faces
      logToTerminal('SCANNING FOR BIOMETRIC SIGNATURES...');
      const detections = detector.detect(img);
      const faceCount = detections.detections.length;
      
      logToTerminal(`[${faceCount}] FACES DETECTED.`);

      if (faceCount > 0) {
        logToTerminal('APPLYING LOCAL REDACTION...');
        
        // Apply blur to each detected face
        for (const detection of detections.detections) {
          const bbox = detection.boundingBox;
          if (bbox) {
            // Add some padding around the face for better coverage
            const padding = Math.min(bbox.width, bbox.height) * 0.15;
            const x = Math.max(0, bbox.originX - padding);
            const y = Math.max(0, bbox.originY - padding);
            const width = Math.min(canvas.width - x, bbox.width + padding * 2);
            const height = Math.min(canvas.height - y, bbox.height + padding * 2);
            
            applyGaussianBlur(ctx, x, y, width, height, 35);
          }
        }
        
        logToTerminal('REDACTION COMPLETE.');
      } else {
        logToTerminal('NO FACES TO REDACT.');
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          },
          file.type || 'image/png',
          0.95
        );
      });

      // Clean up
      URL.revokeObjectURL(imageUrl);

      const resultData: BlackoutResult = {
        blob,
        fileName: `redacted_${file.name}`,
        facesDetected: faceCount,
        originalSize: file.size,
        finalSize: blob.size
      };

      setResult(resultData);
      setStatus('done');
      logToTerminal('BLACKOUT SEQUENCE COMPLETE. ARTIFACT SECURED.');

      return resultData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logToTerminal(`CRITICAL ERROR: ${errorMessage}`);
      setError(errorMessage);
      setStatus('error');
      throw err;
    }
  }, [initializeDetector]);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    result,
    error,
    processImage,
    initializeDetector,
    reset
  };
};
