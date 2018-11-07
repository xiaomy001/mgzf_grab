const brands = require('./brands');
const rooms = require('./rooms');

async function grabData() {
  let brandIds;
  await brands.requestBrandsInfo().then((res) => { brandIds = res; });
  for (let brandId of brandIds) {
    rooms.requestRoomsInfoByBrand(brandId).catch((e) => { console.log(e) });
  }
}

grabData().catch((e) => { console.log(e) });
