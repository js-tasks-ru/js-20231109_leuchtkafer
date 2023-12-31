/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathToArr = path.split('.');
  return function getter (obj) {
    let val;
    for (let item of pathToArr) {
      pathToArr.shift();
      if (obj[item] instanceof Object) {
        return getter(obj[item]);
      }
      val = obj[item];
      return val;
    }
  };
}
