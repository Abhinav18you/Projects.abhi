import { useCallback, useState } from 'react';
import * as piexif from 'piexifjs';
import { logToTerminal } from '../utils/log';

export const useSpoofer = () => {
  const [isSpoofing, setIsSpoofing] = useState(false);

  const injectSpoofing = useCallback(async (blob: Blob): Promise<Blob> => {
    // Only supports JPEG for now
    if (blob.type !== 'image/jpeg') {
      logToTerminal('SPOOFING SKIPPED: FILE FORMAT NOT SUPPORTED (JPEG ONLY).');
      return blob;
    }

    setIsSpoofing(true);
    logToTerminal('INITIATING DISINFORMATION PROTOCOL...');
    logToTerminal('GENERATING FAKE METADATA (NOKIA 3310 / AREA 51)...');

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const zeroth: { [key: number]: any } = {};
      const exif: { [key: number]: any } = {};
      const gps: { [key: number]: any } = {};

      zeroth[piexif.ImageIFD.Make] = "Nokia";
      zeroth[piexif.ImageIFD.Model] = "3310";
      zeroth[piexif.ImageIFD.Software] = "Ghost Drop v1.0";

      exif[piexif.ExifIFD.DateTimeOriginal] = "1999:12:31 23:59:59";

      // Area 51 Coordinates: 37.2431° N, 115.7930° W
      gps[piexif.GPSIFD.GPSLatitudeRef] = "N";
      gps[piexif.GPSIFD.GPSLatitude] = [[37, 1], [14, 1], [3516, 100]]; // 37 deg, 14 min, 35.16 sec
      gps[piexif.GPSIFD.GPSLongitudeRef] = "W";
      gps[piexif.GPSIFD.GPSLongitude] = [[115, 1], [47, 1], [3480, 100]]; // 115 deg, 47 min, 34.80 sec

      const exifObj = { "0th": zeroth, "Exif": exif, "GPS": gps };
      const exifBytes = piexif.dump(exifObj);

      logToTerminal('INJECTING PAYLOAD...');
      const newJpeg = piexif.insert(exifBytes, dataUrl);

      // Convert DataURL back to Blob
      const byteString = atob(newJpeg.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const newBlob = new Blob([ab], { type: 'image/jpeg' });

      logToTerminal('DISINFORMATION COMPLETE.');
      setIsSpoofing(false);
      return newBlob;

    } catch (error) {
      console.error(error);
      logToTerminal('SPOOFING FAILED.');
      setIsSpoofing(false);
      return blob;
    }
  }, []);

  return { injectSpoofing, isSpoofing };
};
