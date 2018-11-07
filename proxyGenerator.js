const lodash = require('lodash');
const proxyList = require('./proxyList');

const max = proxyList.length - 1;

exports.getRandomProxy = () => {
  const index = lodash.random(0, max);
  return proxyList[index];
};

exports.getProxyConfig = () => {
  const proxyConfig = exports.getRandomProxy();
  return `http://${proxyConfig.user}:${proxyConfig.password}@${proxyConfig.host}:${proxyConfig.port}`;
};
