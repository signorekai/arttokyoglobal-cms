"use strict";

const fetch = require("node-fetch");
const ethers = require("ethers");

/**
 * alchemy service
 */
function tryParseJSONObject(jsonString) {
  try {
    var o = JSON.parse(jsonString);
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) {}

  return false;
}

module.exports = ({ strapi }) => ({
  async getABI(contractAddress) {
    const response = await fetch(
      `https://api-${process.env.ETH_NETWORK}.etherscan.io/api?module=contract&action=getabi&apikey=${process.env.ETHERSCAN_API_KEY}&address=${contractAddress}`
    );
    const { result } = await response.json();
    const ABI = tryParseJSONObject(result);
    return ABI;
  },

  async readContract(contractAddress, ABI) {
    const provider = new ethers.providers.AlchemyProvider(
      "goerli",
      process.env.ALCHEMY_API_KEY
    );

    const updatedInfo = {};

    const contract = new ethers.Contract(contractAddress, ABI, provider);
    if (contract) {
      console.log(contract);
      if (contract.name) {
        updatedInfo.title = await contract.name();
      }

      if (contract.maxSupply) {
        updatedInfo.totalTokens = await contract.maxSupply();
      }

      if (contract.artistId) {
        updatedInfo.artist = Number(await contract.artistId());
      }

      if (contract.cost) {
        updatedInfo.mintPrice =
          Number(await contract.cost()) / 1000000000000000000;
      }
    }

    return updatedInfo;
  },
});
