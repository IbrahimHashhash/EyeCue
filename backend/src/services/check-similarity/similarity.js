import { ssim } from 'ssim.js';
import { extractFaceROI } from './faceDetect.js';
import { getPrev, setPrev } from './state.js';

export const SIMILARITY_THRESHOLDS = 0.65 ;

/**
 * Compare current frame (pre-MediaPipe) to previous for a client using
 * BlazeFace-based ROI (faceDetect.js) + SSIM.
 */
export async function compareAgainstPrevious(clientId, frameBuffer) {
  const { chip, rect } = await extractFaceROI(frameBuffer, { target: 160, margin: 0.2 });

  const prev = getPrev(clientId);
  setPrev(clientId, { chip, rect, timestamp: Date.now() });

  if (!prev) return { firstFrame: true };

  const { mssim } = ssim(prev.chip, chip, { ssim: 'fast' });

  const noticeable = mssim < SIMILARITY_THRESHOLDS;

  return {
    firstFrame: false,
    roi: rect,
    scores: { ssim: Number(mssim.toFixed(4)) },
    thresholds: SIMILARITY_THRESHOLDS,
    noticeableChange: noticeable
  };
}
