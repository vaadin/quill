// Copied from https://github.com/vincentdchan/delta-es/blob/main/src/deepEqual.ts

function isEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2)
    // it's just the same object. No need to compare.
    return true;

  if (isPrimitive(obj1) || isPrimitive(obj2))
    // compare primitives
    return obj1 === obj2;

  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;

  // compare objects with same number of keys
  for (const key in obj1) {
    if (!(key in obj2)) return false; // other object doesn't have this prop
    if (!isEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

// check if value is primitive
function isPrimitive(obj: any) {
  return obj !== Object(obj);
}

export default isEqual;
