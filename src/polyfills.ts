import { Buffer } from "buffer";
import process from "process";
import crypto from "crypto-browserify";

window.Buffer = Buffer;
window.process = process;

if (!globalThis.crypto?.getRandomValues) {
  // @ts-ignore
  globalThis.crypto = {
    ...globalThis.crypto,
    getRandomValues: (arr: Uint8Array) => {
      const bytes = crypto.randomBytes(arr.length);
      arr.set(bytes);
      return arr;
    },
  };
}
