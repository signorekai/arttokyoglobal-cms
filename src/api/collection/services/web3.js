"use strict";

const fetch = require("node-fetch");
const ethers = require("ethers");
const IPFSGatewayTools = require("@pinata/ipfs-gateway-tools/dist/node");
const Bottleneck = require("bottleneck");

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
        const gatewayTools = new IPFSGatewayTools(); // better way of getting the CID
        const uriPrefix = await contract.uriPrefix();
        const results = gatewayTools.containsCID(uriPrefix);
        if (results.containsCid) {
          updatedInfo.CID = results.cid;
        }
      }

      if (contract.totalSupply) {
        updatedInfo.totalSupply = Number(await contract.totalSupply());
      }

      if (contract.whitelistMintEnabled) {
        updatedInfo.whitelistMintEnabled =
          await contract.whitelistMintEnabled();
      }

      if (contract.dynamicStart) {
        updatedInfo.dynamicStart = await contract.dynamicStart();
      }

      if (contract.getStartDate) {
        updatedInfo.startDate = await contract.getStartDate();
      }
    }

    return updatedInfo;
  },

  async getAllTokenMetadata(CID, limit) {
    console.log(`${CID} - getting all ${limit} JSONs`);

    // follow rate limits of Pinata's Public Gateway
    const limiter = new Bottleneck({
      minTime: 100,
      maxConcurrent: 4,
    });

    const files = [];
    for (var x = 1; x <= limit; x++) {
      files[x] = `${x}.json`;
    }

    try {
      const tasks = files.map((file) =>
        limiter.schedule(() =>
          strapi.service("api::token.web3").fetchMetadata(CID, file)
        )
      );

      const results = await Promise.all(tasks);
      return results;
    } catch (err) {
      return {};
      limiter.stop();
    }
    // console.log(CID, results.length);
  },
});
