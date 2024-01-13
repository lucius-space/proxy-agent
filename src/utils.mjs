import xml2js from "xml2js";
const parser = new xml2js.Parser();

export const toRFC3339 = (dateStr) => {
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0] + "T00:00:00Z";
};

export const isDateInPast = (date) => new Date(date).getTime() < Date.now();

export const isObject = (val) => typeof val === "object" && val !== null;

const findKeyAndValueStart = async (obj, keyToFind, valueStarts) => {
  if (Array.isArray(obj)) {
    return obj.some((item) => findKeyAndValueStart(item, keyToFind, valueStarts));
  } else if (isObject(obj)) {
    if (keyToFind in obj) {
      const value = obj[keyToFind];
      // Value can be an array or a string
      if (Array.isArray(value)) {
        return value.some((val) => typeof val === "string" && valueStarts.some((v) => val.startsWith(v)));
      } else if (typeof value === "string") {
        return valueStarts.some((v) => val.startsWith(v));
      }
    }
    return Object.values(obj).some((val) => findKeyAndValueStart(val, keyToFind, valueStarts));
  }
  return false;
};

export const filterXMLFiles = async (debug, filename, xmlContent, key, valueStarts) => {
  try {
    const result = await parser.parseStringPromise(xmlContent);
    const match = findKeyAndValueStart(result, key, valueStarts);
    if (debug && !match) {
      console.log(`${new Date().toISOString()} :: ${filename} did not match ${valueStarts} on ${key}`);
    }
    return match;
  } catch (e) {
    console.error(`Error filtering XML files: ${e}`);
  }
};

export const filterByValue = (nestedDict, filterKey, filterValues) => {
  return Object.entries(nestedDict)
    .filter(([_, value]) => filterValues.includes(value[filterKey]))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
};
