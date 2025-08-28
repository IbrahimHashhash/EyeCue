import sharp from 'sharp';
import * as blazeface from '@tensorflow-models/blazeface';
import { tf } from './tf-init.js';

let _modelPromise;
function loadModel() {
  if (!_modelPromise) _modelPromise = blazeface.load();
  return _modelPromise;
}

export async function extractFaceROI(buffer, opts = {}) {
  const { target = 160, margin = 0.2, maxDetectSide = 640 } = opts;

  const meta = await sharp(buffer).metadata();
  const W = meta.width, H = meta.height;
  if (!W || !H) throw new Error('Bad image metadata');

  // Downscale for detection speed
  const scale = Math.min(1, maxDetectSide / Math.max(W, H));
  const detectW = Math.max(1, Math.round(W * scale));
  const detectH = Math.max(1, Math.round(H * scale));

  const { data: rgbSmall } = await sharp(buffer)
  .resize(detectW, detectH, { fit: 'inside' })
  .removeAlpha()
  .toColourspace('srgb') 
  .raw({ depth: 'uchar' })
  .toBuffer({ resolveWithObject: true });


  const input = tf.tensor3d(rgbSmall, [detectH, detectW, 3], 'int32').toFloat();
  const model = await loadModel();
  const preds = await model.estimateFaces(input, false);
  input.dispose();

  let x, y, w, h;
  if (preds.length) {
    let best = preds[0], bestArea = 0;
    for (const p of preds) {
      const [x0, y0] = p.topLeft, [x1, y1] = p.bottomRight;
      const area = (x1 - x0) * (y1 - y0);
      if (area > bestArea) { bestArea = area; best = p; }
    }
    const [sx0, sy0] = best.topLeft, [sx1, sy1] = best.bottomRight;
    x = Math.round(sx0 / scale); y = Math.round(sy0 / scale);
    w = Math.round((sx1 - sx0) / scale); h = Math.round((sy1 - sy0) / scale);
  } else {
    // fallback if no detection
    const side = Math.round(Math.min(W, H) * 0.6);
    x = Math.floor((W - side) / 2);
    y = Math.floor((H - side) / 3);
    w = h = side;
  }

  // Expand margin, clamp, square
  const mx = Math.round(w * margin), my = Math.round(h * margin);
  let x0 = Math.max(0, x - mx), y0 = Math.max(0, y - my);
  let x1 = Math.min(W, x + w + mx), y1 = Math.min(H, y + h + my);
  const side = Math.min(x1 - x0, y1 - y0);
  const crop = { left: x0, top: y0, width: side, height: side };

  // Crop → grayscale → normalize → resize → raw 1-channel
  const { data: gray } = await sharp(buffer)
    .extract(crop).grayscale()
    .resize(target, target, { fit: 'fill' })
    .normalize()
    .raw({ depth: 'uchar' })
    .toBuffer({ resolveWithObject: true });

  // Pack to RGBA for ssim.js
  const rgba = new Uint8ClampedArray(target * target * 4);
  for (let i = 0, j = 0; i < gray.length; i++, j += 4) {
    const v = gray[i];
    rgba[j] = v; rgba[j+1] = v; rgba[j+2] = v; rgba[j+3] = 255;
  }

  return {
    chip: { data: rgba, width: target, height: target },
    rect: { x: crop.left, y: crop.top, w: crop.width, h: crop.height }
  };
}
