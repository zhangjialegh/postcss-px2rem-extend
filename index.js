const defaultOpts = {
  remUnit: 75,
  remPrecision: 6,
  selectorBlackList: [],
  propWhiteList: [],
  propBlackList: [],
  ignoreIdentifier: false,
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
};

const toFixed = (number, precision) => {
  const multiplier = Math.pow(10, precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
};
const isObject = o => typeof o === 'object' && o !== null;

const createPxReplace = (rootValue, identifier, remPrecision, minPixelValue) => (m, $1, $2) => {
  if (!$1) return m;
  if (identifier && m.indexOf(identifier) === 0) return m.replace(identifier, '');
  const pixels = parseFloat($1);
  if (pixels < minPixelValue) return m;
  // { px: 100, rpx: 50 }
  const baseValue = isObject(rootValue) ? rootValue[$2] : rootValue;
  const fixedVal = toFixed((pixels / baseValue), remPrecision);

  return `${fixedVal}rem`;
};

const declarationExists = (decls, prop, value) => decls.some(decl =>
  decl.prop === prop && decl.value === value
);

const blacklistedSelector = (blacklist, selector) => {
  if (typeof selector !== 'string') return false;

  return blacklist.some(regex => {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1;

    return selector.match(regex);
  });
};

const blacklistedProp = (blacklist, prop) => {
  if (typeof prop !== 'string') return false;

  return blacklist.some(regex => {
    if (typeof regex === 'string') return prop.indexOf(regex) !== -1;

    return prop.match(regex);
  });
};

const handleIgnoreIdentifierRegx = (identifier, unit) => {
  const _identifier = identifier;
  let backslashfy = _identifier.split('').join('\\');
  backslashfy = `\\${backslashfy}`;
  const pattern = `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|((?:${backslashfy}|\\d*)\\.?\\d+)(${unit})`;

  return new RegExp(pattern, 'ig');
};
module.exports = (options = {}) => {

  const opts = { ...defaultOpts, ...options };
  let unit = 'px';
  if (isObject(opts.rootValue)) {
    unit = Object.keys(opts.rootValue).join('|');
  }

  const regText = `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|(\\d*\\.?\\d+)(${unit})`;
  let pxRegex = new RegExp(regText, 'ig');
  let identifier = opts.ignoreIdentifier;
  if (identifier && typeof identifier === 'string') {
    identifier = identifier.replace(/\s+/g, '');
    opts.replace = true;
    pxRegex = handleIgnoreIdentifierRegx(identifier, unit);
  } else {
    identifier = false;
  }

  const pxReplace = createPxReplace(opts.remUnit, identifier, opts.remPrecision, opts.minPixelValue);

  return {
    postcssPlugin: 'postcss-px2rem-extend',
  /*
    Root(root) {
      const nodes = root.nodes
      console.log(nodes, 'nodes')
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.name === 'media') {
          for (var dpr = 1; dpr <= 3; dpr++) {
            var newNode = node.clone();
            newNode.params = '[data-dpr="' + dpr + '"] ' + node.params
            root.prepend(node, newNode)
          }
        }
      }
    },
    */

    Declaration(decl) {
      if (decl.parent && decl.parent.name === 'media') {
        return
      }
      const _decl = decl
      // 1st check exclude
      if (opts.exclude && css.source.input.file && css.source.input.file.match(opts.exclude) !== null) return;
      // 2st check 'px'
      if (_decl.value.indexOf('px') === -1) return;
      // 3nd check property black list
      if (blacklistedProp(opts.propBlackList, _decl.prop)) return;
      // 5th check seletor black list
      if (blacklistedSelector(opts.selectorBlackList, _decl.parent.selector)) return;
      const value = _decl.value.replace(pxRegex, pxReplace);
      // if rem unit already exists, do not add or replace
      if (declarationExists(_decl.parent, _decl.prop, value)) return;
      _decl.value = value;
    }

    /*
    Declaration: {
      color: (decl, postcss) {
        // The fastest way find Declaration node if you know property name
      }
    }
    */
  }
}
module.exports.postcss = true
