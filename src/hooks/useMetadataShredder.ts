import { useCallback, useState } from 'react';

type SupportedMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

const SUPPORTED_MIME_TYPES: SupportedMimeType[] = ['image/jpeg', 'image/png', 'image/webp'];
const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const RIFF_SIGNATURE = 'RIFF';
const WEBP_SIGNATURE = 'WEBP';

// PNG chunks that commonly store EXIF/text metadata.
const PNG_METADATA_CHUNKS = new Set(['eXIf', 'iTXt', 'tEXt', 'zTXt', 'tIME']);

// WEBP chunks that store metadata we want removed.
const WEBP_METADATA_CHUNKS = new Set(['EXIF', 'XMP ']);

// JPEG APP markers used for metadata (EXIF/XMP/IPTC/ICC profiles).
// APP0 (JFIF) and APP14 (Adobe) are intentionally preserved for compatibility.
const JPEG_METADATA_APP_MARKERS = new Set([0xe1, 0xe2, 0xed]);

const textEncoder = new TextEncoder();

const assertSupportedType = (file: File): SupportedMimeType => {
  if (SUPPORTED_MIME_TYPES.includes(file.type as SupportedMimeType)) {
    return file.type as SupportedMimeType;
  }

  throw new Error('Unsupported file type. Please use JPG, PNG, or WEBP.');
};

const sliceToString = (view: Uint8Array, start: number, length: number): string => {
  let output = '';

  for (let index = 0; index < length; index += 1) {
    output += String.fromCharCode(view[start + index]);
  }

  return output;
};

const concatByteChunks = (chunks: Uint8Array[], totalLength: number): ArrayBuffer => {
  const output = new Uint8Array(totalLength);
  let writeOffset = 0;

  chunks.forEach((chunk) => {
    output.set(chunk, writeOffset);
    writeOffset += chunk.length;
  });

  return output.buffer;
};

const isJpegMetadataMarker = (marker: number): boolean => JPEG_METADATA_APP_MARKERS.has(marker);

const stripJpegMetadata = (buffer: ArrayBuffer): ArrayBuffer => {
  const bytes = new Uint8Array(buffer);

  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return buffer;
  }

  const chunks: Uint8Array[] = [bytes.subarray(0, 2)];
  let totalLength = 2;
  let offset = 2;

  while (offset + 1 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      const remaining = bytes.subarray(offset);
      chunks.push(remaining);
      totalLength += remaining.length;
      break;
    }

    const marker = bytes[offset + 1];

    // EOI
    if (marker === 0xd9) {
      const eoi = bytes.subarray(offset, offset + 2);
      chunks.push(eoi);
      totalLength += eoi.length;
      break;
    }

    // SOS, copy remainder as image stream.
    if (marker === 0xda) {
      const imageStream = bytes.subarray(offset);
      chunks.push(imageStream);
      totalLength += imageStream.length;
      break;
    }

    if (offset + 3 >= bytes.length) {
      const remaining = bytes.subarray(offset);
      chunks.push(remaining);
      totalLength += remaining.length;
      break;
    }

    const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const segmentEnd = offset + 2 + segmentLength;

    if (segmentLength < 2 || segmentEnd > bytes.length) {
      const remaining = bytes.subarray(offset);
      chunks.push(remaining);
      totalLength += remaining.length;
      break;
    }

    if (!isJpegMetadataMarker(marker)) {
      const segment = bytes.subarray(offset, segmentEnd);
      chunks.push(segment);
      totalLength += segment.length;
    }

    offset = segmentEnd;
  }

  return concatByteChunks(chunks, totalLength);
};

const stripPngMetadata = (buffer: ArrayBuffer): ArrayBuffer => {
  const bytes = new Uint8Array(buffer);

  if (bytes.length < PNG_SIGNATURE.length || !PNG_SIGNATURE.every((value, index) => bytes[index] === value)) {
    return buffer;
  }

  const chunks: Uint8Array[] = [PNG_SIGNATURE];
  let totalLength = PNG_SIGNATURE.length;
  let offset = PNG_SIGNATURE.length;

  while (offset + 8 <= bytes.length) {
    const length =
      (bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3];

    if (length < 0) {
      const remaining = bytes.subarray(offset);
      chunks.push(remaining);
      totalLength += remaining.length;
      break;
    }

    const chunkTotalLength = 12 + length;
    const chunkEnd = offset + chunkTotalLength;

    if (chunkEnd > bytes.length) {
      const remaining = bytes.subarray(offset);
      chunks.push(remaining);
      totalLength += remaining.length;
      break;
    }

    const chunkType = sliceToString(bytes, offset + 4, 4);

    if (!PNG_METADATA_CHUNKS.has(chunkType)) {
      const chunk = bytes.subarray(offset, chunkEnd);
      chunks.push(chunk);
      totalLength += chunk.length;
    }

    offset = chunkEnd;

    if (chunkType === 'IEND') {
      break;
    }
  }

  return concatByteChunks(chunks, totalLength);
};

const updateWebpVp8xFlags = (chunk: Uint8Array, removedMetadata: string[]): Uint8Array => {
  if (chunk.length < 18) {
    return chunk;
  }

  const chunkType = String.fromCharCode(chunk[0], chunk[1], chunk[2], chunk[3]);
  if (chunkType !== 'VP8X') {
    return chunk;
  }

  const updated = new Uint8Array(chunk);
  const metadataBits = {
    EXIF: 0x08,
    'XMP ': 0x04,
  } as const;

  removedMetadata.forEach((type) => {
    const bit = metadataBits[type as keyof typeof metadataBits];
    if (bit) {
      updated[8] &= ~bit;
    }
  });

  return updated;
};

const stripWebpMetadata = (buffer: ArrayBuffer): ArrayBuffer => {
  const bytes = new Uint8Array(buffer);

  if (bytes.length < 12 || sliceToString(bytes, 0, 4) !== RIFF_SIGNATURE || sliceToString(bytes, 8, 4) !== WEBP_SIGNATURE) {
    return buffer;
  }

  const chunks: Uint8Array[] = [];
  const removedMetadata: string[] = [];
  let offset = 12;

  while (offset + 8 <= bytes.length) {
    const chunkType = sliceToString(bytes, offset, 4);
    const chunkSize =
      bytes[offset + 4] |
      (bytes[offset + 5] << 8) |
      (bytes[offset + 6] << 16) |
      (bytes[offset + 7] << 24);

    if (chunkSize < 0) {
      chunks.push(bytes.slice(offset));
      break;
    }

    const paddedChunkSize = chunkSize + (chunkSize % 2);
    const chunkTotalLength = 8 + paddedChunkSize;
    const chunkEnd = offset + chunkTotalLength;

    if (chunkEnd > bytes.length) {
      chunks.push(bytes.slice(offset));
      break;
    }

    const fullChunk = bytes.slice(offset, chunkEnd);

    if (!WEBP_METADATA_CHUNKS.has(chunkType)) {
      chunks.push(fullChunk);
    } else {
      removedMetadata.push(chunkType);
    }

    offset = chunkEnd;
  }

  const adjustedChunks = chunks.map((chunk) => updateWebpVp8xFlags(chunk, removedMetadata));
  const payloadSize = adjustedChunks.reduce((sum, chunk) => sum + chunk.length, 4);
  const totalSize = 8 + payloadSize;

  const output = new Uint8Array(totalSize);
  output.set(textEncoder.encode(RIFF_SIGNATURE), 0);
  new DataView(output.buffer).setUint32(4, payloadSize, true);
  output.set(textEncoder.encode(WEBP_SIGNATURE), 8);

  let writeOffset = 12;
  adjustedChunks.forEach((chunk) => {
    output.set(chunk, writeOffset);
    writeOffset += chunk.length;
  });

  return output.buffer;
};

const stripMetadata = (buffer: ArrayBuffer, mimeType: SupportedMimeType): ArrayBuffer => {
  switch (mimeType) {
    case 'image/jpeg':
      return stripJpegMetadata(buffer);
    case 'image/png':
      return stripPngMetadata(buffer);
    case 'image/webp':
      return stripWebpMetadata(buffer);
    default:
      return buffer;
  }
};

export const useMetadataShredder = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shredMetadata = useCallback(async (file: File): Promise<Blob> => {
    const mimeType = assertSupportedType(file);
    setError(null);
    setIsProcessing(true);

    try {
      const sourceBuffer = await file.arrayBuffer();
      const cleanBuffer = stripMetadata(sourceBuffer, mimeType);
      return new Blob([cleanBuffer], { type: mimeType });
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : 'Unable to sanitize metadata.';
      setError(message);
      throw unknownError;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { shredMetadata, isProcessing, error };
};
