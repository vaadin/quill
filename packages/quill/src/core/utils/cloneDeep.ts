// Copied from https://github.com/vincentdchan/delta-es/blob/main/src/cloneDeep.ts

/**
 * This is much smaller and faster than the lodash-es version.
 */
function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export default cloneDeep;
