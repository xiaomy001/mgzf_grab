const lodash = require('lodash');

exports.generateRandomUUID = () => {
  let uuid = 'oPUbl5';

  const length = 22;
  let p = 1;

  const charA = 'A'.charCodeAt();
  const charZ = 'Z'.charCodeAt();
  const chara = 'a'.charCodeAt();
  const charz = 'z'.charCodeAt();

  while (p <= length) {
    const rand = lodash.random(50, 127);

    let randChar;
    if ((rand >= charA && rand <= charZ) || (rand >= chara && rand <= charz)) {
      randChar = String.fromCharCode(rand);
    } else {
      randChar = String(rand % 10);
    }
    uuid += randChar;

    p++;
  }

  return uuid;
};
