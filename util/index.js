const toFixed = (number, precision) => {
  const multiplier = Math.pow(10, precision + 1);
  const wholeNumber = Math.floor(number * multiplier);

  return (Math.round(wholeNumber / 10) * 10) / multiplier;
};

const isObject = (o) => typeof o === "object" && o !== null;

module.exports.createPxReplace = (
  remUnit,
  identifier,
  remPrecision,
  minPixelValue
) => (m, $1, $2) => {
  if (!$1) return m;
  if (identifier && m.indexOf(identifier) === 0)
    return m.replace(identifier, "");
  const pixels = parseFloat($1);
  if (pixels < minPixelValue) return m;
  // { px: 100, rpx: 50 }
  const baseValue = isObject(remUnit) ? remUnit[$2] : remUnit;
  const fixedVal = toFixed(pixels / baseValue, remPrecision);
  return `${fixedVal}rem`;
};

module.exports.createPxRegex = (identifier, unit) => {
  const regText = `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|(\\d*\\.?\\d+)(${unit})`;
  let pxRegex = new RegExp(regText, "ig");
  if (identifier && typeof identifier === "string") {
    identifier = identifier.replace(/\s+/g, "");
    let backslashfy = identifier.split("").join("\\");
    backslashfy = `\\${backslashfy}`;
    const pattern = `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|((?:${backslashfy}|\\d*)\\.?\\d+)(${unit})`;
    pxRegex = new RegExp(pattern, "ig");
  }
  return pxRegex;
};

module.exports.createUnit = (remUnit) => {
  let unit = "px";
  if (isObject(remUnit)) {
    unit = Object.keys(opts.remUnit).join("|");
  }
  return unit;
};

module.exports.declarationExists = (decls, prop, value) =>
  decls.some((decl) => decl.prop === prop && decl.value === value);

module.exports.blacklistedSelector = (blacklist, selector) => {
  if (typeof selector !== "string") return false;
  return blacklist.some((regex) => {
    if (typeof regex === "string") return selector.indexOf(regex) !== -1;
    return selector.match(regex);
  });
};

module.exports.blacklistedProp = (blacklist, prop) => {
  if (typeof prop !== "string") return false;
  return blacklist.some((regex) => {
    if (typeof regex === "string") return prop.indexOf(regex) !== -1;
    return prop.match(regex);
  });
};
