"use strict";

const fetch = require("node-fetch");
const ethers = require("ethers");
const IPFSGatewayTools = require("@pinata/ipfs-gateway-tools/dist/node");
const gatewayTools = new IPFSGatewayTools();

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
        updatedInfo.mintPrice = Number(await contract.cost());
      }
      if (contract.uriPrefix) {
        // const re = new RegExp(
        //   /^ipfs:\/\/(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})\/$/
        // );
        const uriPrefix = await contract.uriPrefix();
        const results = gatewayTools.containsCID(uriPrefix);
        if (results.containsCid) {
          updatedInfo.CID = results.cid;
        }
      }
    }

    return updatedInfo;
  },
});