const request = require('request-promise-native');
const proxyGenerator = require('./proxyGenerator');
const fs = require('fs');
const lodash = require('lodash');
const uuid = require('./uuid');
const storage = require('./storage');
const values = require('./values');

const startPage = 2;
let roomsStorage = undefined;

exports.requestRoomsInfoByBrand = async function (brandId) {
  roomsStorage = new storage(`brand_${brandId}_rooms`);

  try {
    let totalPagesNumber = 0;
    await requestTheFirstPage(brandId).then((res) => { totalPagesNumber = res });
    await requestTheRestPages(brandId, totalPagesNumber);
  } catch (e) {
    fs.writeSync(roomsStorage.getLogFd(), `${e}\n`);
  }

  roomsStorage.closeAllFds();
};

async function requestTheFirstPage(brandId) {
  const options = generateRequestOptions(brandId, 1);
  let totalPagesNumber = 0;

  await request(options).then((res) => {
    const data = JSON.parse(res);
    if (
      data.code === '10000'
      && lodash.get(data, 'content.page.totalPage', false)
      && lodash.get(data, 'content.roomInfos', false)
    ) {
      totalPagesNumber = data.content.page.totalPage;
      for (let roomInfo of data.content.roomInfos) {
        fs.writeSync(roomsStorage.getDataFd(), JSON.stringify(roomInfo) + "\n");
      }
    } else {
      fs.writeSync(roomsStorage.getRequestErrorFd(), `first page request error: ${res}\n`);
    }
  });

  return totalPagesNumber;
}

async function requestTheRestPages(brandId, totalPagesNumber) {
  const pageValues = new values(startPage, totalPagesNumber);
  let requestsArray = [];

  while (!pageValues.isEnd()) {
    const currentPage = pageValues.getCurrentValue();
    const options = generateRequestOptions(brandId, currentBrandId);

    requestsArray.push(
      request(options)
        .then((res) => {
          const data = JSON.parse(res);
          if (data.code === '10000' && lodash.get(data, 'content.roomInfos', false)) {
            for (let roomInfo of data.content.roomInfos) {
              fs.writeSync(roomsStorage.getDataFd(), JSON.stringify(roomInfo) + "\n");
            }
          } else {
            fs.writeSync(roomsStorage.getRequestErrorFd(), `currentPage#${currentPage}: ${res}\n`);
          }
        })
        .catch((e) => {
          pageValues.addFailedValue(currentPage);
          fs.writeSync(roomsStorage.getLogFd(), `currentPage#${currentPage}: ${e}\n`);
        })
    );

    if (requestsArray.length = 100 || pageValues.isEnd()) {
      await Promise.all(requestsArray);
      requestsArray = [];
    }
  }
}

function generateRequestOptions(brandId, page) {
  return {
    uri: 'https://api.mgzf.com/mogoroom-find/v2/find/getRoomListByCriteria',
    proxy: proxyGenerator.getProxyConfig(),
    method: 'POST',
    form: {
      'brandId': brandId,
      'rentTypes': '',
      'subwayIds': '',
      'houseType': '',
      'minPrice': '',
      'maxPrice': '',
      'order': 0,
      'currentPage': page,
      'cityId': ''
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
