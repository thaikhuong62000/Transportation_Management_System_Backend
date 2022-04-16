"use strict";

module.exports = {
  async calcFee(from_address, to_address, packages, user, voucher) {
    const distance = calcDistance(from_address, to_address); //km
    const { base = 1, current = 1 } = strapi.tms.config.oil;
    const gtgt = current / base;
    const weight = packages.reduce(
      (pre, curr) => pre + curr.quantity * curr.weight,
      0
    );
    // TODO: Apply Voucher
    return calcFeeFromDistance(strapi, weight, distance) * gtgt;
  },
};

function calcDistance() {}

function calcFeeFromDistance(strapi, weight, distance) {
  const fee_config = strapi.tms.config.fee;
  let weight_case = Object.keys(fee_config)
    .map((x) => parseFloat(x))
    .filter((x) => x >= weight)
    .sort((a, b) => a - b);
  if (weight_case.length >= 1) weight_case = fee_config[weight_case[0]];
  else weight_case = fee_config.x;

  let { 4: fee } = weight_case;
  const _distance = Object.keys(weight_case);
  for (let i = 0; i < _distance.length - 1; i++) {
    if (distance > _distance[i]) {
      if (distance <= _distance[i + 1]) {
        fee += (distance - _distance[i]) * weight_case[_distance[i + 1]];
      } else {
        fee +=
          (_distance[i + 1] - _distance[i]) * weight_case[_distance[i + 1]];
      }
    }
  }
  return fee;
}
