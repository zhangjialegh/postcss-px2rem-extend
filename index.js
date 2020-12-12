/**
 * respect to https://github.com/cuth/postcss-pxtorem/
 **/
const postcss = require("postcss");
const {
  createUnit,
  createPxReplace,
  declarationExists,
  blacklistedSelector,
  blacklistedProp,
  createPxRegex,
} = require("./util");

const defaultOpts = {
  remUnit: 75,
  remPrecision: 6,
  selectorBlackList: [],
  propBlackList: [],
  ignoreIdentifier: false,
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
};

module.exports = postcss.plugin("postcss-px2rem-extend", (options) => {
  const opts = { ...defaultOpts, ...options };
  const unit = createUnit(opts.remUnit);
  let identifier = opts.ignoreIdentifier;
  const pxRegex = createPxRegex(identifier, unit);
  if (identifier && typeof identifier === "string") {
    opts.replace = true;
  } else {
    identifier = false;
  }
  const pxReplace = createPxReplace(
    opts.remUnit,
    identifier,
    opts.remPrecision,
    opts.minPixelValue
  );

  return (css) => {
    css.walkDecls((decl, i) => {
      const _decl = decl;
      // 1st check exclude
      if (
        opts.exclude &&
        css.source.input.file &&
        css.source.input.file.match(opts.exclude) !== null
      )
        return;
      // 2st check 'px'
      if (_decl.value.indexOf("px") === -1) return;
      // 3nd check property black list
      if (blacklistedProp(opts.propBlackList, _decl.prop)) return;
      // 5th check seletor black list
      if (blacklistedSelector(opts.selectorBlackList, _decl.parent.selector))
        return;

      const value = _decl.value.replace(pxRegex, pxReplace);

      // if rem unit already exists, do not add or replace
      if (declarationExists(_decl.parent, _decl.prop, value)) return;

      if (opts.replace) {
        _decl.value = value;
      } else {
        _decl.parent.insertAfter(
          i,
          _decl.clone({
            value,
          })
        );
      }
    });

    if (opts.mediaQuery) {
      css.walkAtRules("media", (rule) => {
        const _rule = rule;
        if (_rule.params.indexOf("px") === -1) return;
        _rule.params = _rule.params.replace(pxRegex, pxReplace);
      });
    }
  };
});
