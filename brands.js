const request = require('request-promise-native');
const proxyGenerator = require('./proxyGenerator');
const fs = require('fs');
const lodash = require('lodash');
const uuid = require('./uuid');
const storage = require('./storage');
const values = require('./values');

exports.requestBrandsInfo = async () => {
  const brandStorage = new storage('brand');

  const maxBranIdByGuess = 1000;
  const startBrandId = 1;
  const brandIdValues = new values(startBrandId, maxBranIdByGuess);
  let brandIds = [];
  let requestsArray = [];

  while (!brandIdValues.isEnd()) {
    const currentBrandId = brandIdValues.getCurrentValue();
    const options = generateRequestOptions(currentBrandId);

    requestsArray.push(
      request(options)
        .then((res) => {
          const data = JSON.parse(res);
          if (data.code === '10000' && lodash.get(data, 'content.brandId', false)) {
            brandIds.push(data.content.brandId);
            fs.writeSync(brandStorage.getDataFd(), JSON.stringify(data.content) + "\n");
          } else {
            fs.writeSync(brandStorage.getRequestErrorFd(), `currentBrandId#${currentBrandId}: ${res}\n`);
          }
        })
        .catch((e) => {
          brandIdValues.addFailedValue(currentBrandId);
          fs.writeSync(brandStorage.getLogFd(), `currentBrandId#${currentBrandId}: ${e}\n`);
        })
    );

    if (requestsArray.length = 100 || brandIdValues.isEnd()) {
      await Promise.all(requestsArray);
      requestsArray = [];
    }
  }

  brandStorage.closeAllFds();

  return brandIds;
};

function generateRequestOptions(brandId) {
  return {
    uri: 'https://api.mgzf.com/mogoroom-find/v2/find/brand/getBrandDetailInfo',
    proxy: proxyGenerator.getProxyConfig(),
    method: 'POST',
    form: {
      'brandId': brandId
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366 MicroMessenger/6.7.3(0x16070321) NetType/WIFI Language/zh_CN',
      'Referer': 'https://servicewechat.com/wxa32d290fc833e4e1/25/page-frame.html',
      'Accept': '*/*',
      'Channel': '56',
      'UserId': '',
      'Timestamp': lodash.now(),
      'AppVersion': '1.0',
      'OS': 'android',
      'Accept-Language': 'zh-cn',
      'Token': '',
      'Model': 'iPhone 6<iPhone7,2>',
      'OSVersion': 'iOS 12.0',
      'UUID': uuid.generateRandomUUID(),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
}
