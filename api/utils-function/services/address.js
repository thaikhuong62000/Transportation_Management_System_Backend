"use strict";

module.exports = {
  async prepareAddress(address) {
    if (!address.latitude || !address.longitude) {
      const response = await strapi.geocode(mergeAddress(address));
      const coord = response.data.results[0].geometry.location;
      address.latitude = coord.lat;
      address.longitude = coord.lng;
    }
    return address;
  },
};

function mergeAddress(address) {
  let newAddress = "";
  ["street", "ward", "province", "city"].forEach((element) => {
    if (address[element] && address[element] !== "")
      newAddress = newAddress + `, ${address[element]}`;
  });
  return newAddress.slice(1);
}
