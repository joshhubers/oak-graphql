const MAX_ARRAY_LENGTH = 10;
const MAX_RECURSIVE_DEPTH = 2;

/**
 * Used to print values in error messages.
 */
export function inspect(value: any): string {
  return formatValue(value, []);
}

function formatValue(value: any, seenValues: Array<any>): string {
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "function":
      return value.name
        ? `[function ${(value as (...args: any[]) => any).name}]`
        : "[function]";
    case "object":
      if (value === null) {
        return "null";
      }
      return formatObjectValue(value, seenValues);
    default:
      return String(value);
  }
}

function formatObjectValue(
  value: any,
  previouslySeenValues: Array<any>,
): string {
  if (previouslySeenValues.indexOf(value) !== -1) {
    return "[Circular]";
  }

  const seenValues = [...previouslySeenValues, value];
  const customInspectFn = getCustomFn(value);

  if (customInspectFn !== undefined) {
    const customValue = customInspectFn.call(value);

    // check for infinite recursion
    if (customValue !== value) {
      return typeof customValue === "string"
        ? customValue
        : formatValue(customValue, seenValues);
    }
  } else if (Array.isArray(value)) {
    return formatArray(value, seenValues);
  }

  return formatObject(value, seenValues);
}

function formatObject(object: any, seenValues: Array<any>) {
  const keys = Object.keys(object);
  if (keys.length === 0) {
    return "{}";
  }

  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return "[" + getObjectTag(object) + "]";
  }

  const properties = keys.map((key) => {
    const value = formatValue(object[key], seenValues);
    return key + ": " + value;
  });

  return "{ " + properties.join(", ") + " }";
}

function formatArray(array: Array<any>, seenValues: Array<any>): string {
  if (array.length === 0) {
    return "[]";
  }

  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return "[Array]";
  }

  const len = Math.min(MAX_ARRAY_LENGTH, array.length);
  const remaining = array.length - len;
  const items = [];

  for (let i = 0; i < len; ++i) {
    items.push(formatValue(array[i], seenValues));
  }

  if (remaining === 1) {
    items.push("... 1 more item");
  } else if (remaining > 1) {
    items.push(`... ${remaining.toString(10)} more items`);
  }

  return "[" + items.join(", ") + "]";
}

function getCustomFn(obj: any) {
  if (typeof obj.inspect === "function") {
    return obj.inspect;
  }
}

function getObjectTag(obj: any): string {
  const tag = Object.prototype.toString
    .call(obj)
    .replace(/^\[object /, "")
    .replace(/]$/, "");

  if (tag === "Object" && typeof obj.constructor === "function") {
    const name = obj.constructor.name;
    if (typeof name === "string" && name !== "") {
      return name;
    }
  }

  return tag;
}
