/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) { return ''; }
  if (!size)  { return string; }
  let counter = 0;
  let str = '';
  let stringArr = string.split('');
  stringArr.forEach((currentValue, index, array) => {
    if (currentValue !== array[index - 1]) {
      counter = 0;
    }
    ++counter;
    if (counter <= size) {
      str += currentValue;
    }
  });
  return str;
}
