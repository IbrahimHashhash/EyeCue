import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';
import { setWasmPaths /*, setThreadsCount*/ } from '@tensorflow/tfjs-backend-wasm';

export async function initTF() {
  setWasmPaths('node_modules/@tensorflow/tfjs-backend-wasm/dist/');
  await tf.setBackend('wasm');
  await tf.ready();
  if (tf.getBackend() !== 'wasm') throw new Error('WASM backend not active');
}

export { tf };
