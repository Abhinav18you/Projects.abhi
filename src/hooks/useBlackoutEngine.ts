import { useCallback, useRef, useState } from 'react';
import { FilesetResolver, FaceDetector } from '@mediapipe/tasks-vision';
import { logToTerminal } from '../utils/log';

export type BlackoutStatus = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error';

export interface BlackoutResult {
  blob: Blob;
  previewUrl: string;
  fileName: string;
  facesDetected: number;
  originalSize: number;
  finalSize: number;
}

// Constants for face detection and blur settings
const FACE_PADDING_RATIO = 0.15;
const FACE_BLUR_AMOUNT = 35;

export const useBlackoutEngine = () => {
  const [status, setStatus] = useState<BlackoutStatus>('idle');
  const [result, setResult] = useState<BlackoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const faceDetectorRef = useRef<FaceDetector | null>(null);
  const isInitializedRef = useRef(false);
  const previewUrlRef = useRef<string | null>(null);

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
    originalImage: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
    blurAmount: number = FACE_BLUR_AMOUNT
  ) => {
    // Extract, Blur, and Stamp method
    // 1. Create an Off-Screen Canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) return;

    // 2. Apply Filter to Temp Context
    tempCtx.filter = `blur(${blurAmount}px)`;

    // 3. Extract and Draw
    tempCtx.drawImage(originalImage, x, y, width, height, 0, 0, width, height);

    // 4. Stamp it Back
    ctx.drawImage(tempCanvas, x, y);
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
            // Add padding around the face for better coverage
            const padding = Math.min(bbox.width, bbox.height) * FACE_PADDING_RATIO;
            const x = Math.max(0, bbox.originX - padding);
            const y = Math.max(0, bbox.originY - padding);
            const width = Math.min(canvas.width - x, bbox.width + padding * 2);
            const height = Math.min(canvas.height - y, bbox.height + padding * 2);
            
            applyGaussianBlur(ctx, img, x, y, width, height);
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
          'image/png',
          1.0
        );
      });

      // Create preview URL from the blob for UI display
      const previewUrl = URL.createObjectURL(blob);
      // Store previewUrl in ref for cleanup during reset
      previewUrlRef.current = previewUrl;

      // Clean up original image URL
      URL.revokeObjectURL(imageUrl);

      // Ensure filename ends in .png
      const originalName = file.name.replace(/\.[^/.]+$/, "");
      const fileName = `redacted_${originalName}.png`;

      const resultData: BlackoutResult = {
        blob,
        previewUrl,
        fileName,
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
    // Clean up preview URL if it exists (using ref to avoid dependency on result)
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    // Set status to 'ready' if detector is already initialized, otherwise 'idle'
    setStatus(isInitializedRef.current ? 'ready' : 'idle');
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
