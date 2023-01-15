"use strict";

const fetch = require("node-fetch");
const ethers = require("ethers");
const IPFSGatewayTools = require("@pinata/ipfs-gateway-tools/dist/node");
const Bottleneck = require("bottleneck");

const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

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
  async checkWhitelist(addresses, address) {
    class Whitelist {
      constructor(addresses) {
        this.merkleTree = this.getMerkleTree(addresses);
      }

      getMerkleTree(addresses) {
        if (this.merkleTree === undefined) {
          const leafNodes = addresses.map((addr) => keccak256(addr));

          this.merkleTree = new MerkleTree(leafNodes, keccak256, {
            sortPairs: true,
          });
        }

        return this.merkleTree;
      }

      getProofForAddress(address) {
        return this.getMerkleTree().getHexProof(keccak256(address));
      }

      getRawProofForAddress(address) {
        return this.getProofForAddress(address)
          .toString()
          .replaceAll("'", "")
          .replaceAll(" ", "");
      }

      contains(address) {
        return (
          this.getMerkleTree().getLeafIndex(Buffer.from(keccak256(address))) >=
          0
        );
      }
    }

    const whitelist = new Whitelist(addresses);

    return {
      isUserWhitelisted: whitelist.contains(address),
      whitelistProof: whitelist.getProofForAddress(address),
    };
  },
  async getABI(contractAddress) {
    const response = await fetch(
      `https://${process.env.ETHERSCAN_NETWORK}.etherscan.io/api?module=contract&action=getabi&apikey=${process.env.ETHERSCAN_API_KEY}&address=${contractAddress}`
    );
    const { result } = await response.json();
    const ABI = tryParseJSONObject(result);
    return ABI;
  },

  async readContract(contractAddress, ABI, options) {
    const opts = {
      overwriteDescription: false,
      supplyFunction: "totalSupply",
      whitelistMintFunction: "whitelistMint",
      ...options,
    };
    const provider = new ethers.providers.AlchemyProvider(
      process.env.ETH_NETWORK,
      process.env.ALCHEMY_API_KEY
    );

    console.log(10, opts);

    const updatedInfo = {};

    const contract = new ethers.Contract(contractAddress, ABI, provider);
    if (contract) {
      if (opts.overwriteDescription) {
        updatedInfo.description = await contract.projDescription();
      }

      if (contract.name) {
        updatedInfo.title = await contract.name();
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
        // for minting
        updatedInfo.totalSupply = Number(await contract.totalSupply());
      }

      if (contract.maxSupply) {
        // total mintable
        updatedInfo.totalTokens = Number(await contract.maxSupply());
      }

      if (contract.reserveCount) {
        // for community reserving
        updatedInfo.reserveCount = Number(await contract.reserveCount());
      }

      if (contract.reserveSupply) {
        // total reserveable
        updatedInfo.reserveSupply = Number(await contract.reserveSupply());
      }

      if (contract.getStartDate) {
        updatedInfo.startDate = Number(await contract.getStartDate());
      }

      if (contract.paused) {
        const paused = await contract.paused();

        if (paused) {
          updatedInfo.status = "MintingPaused";
        }
      }

      if (contract[`${opts.whitelistMintFunction}Enabled`]) {
        updatedInfo.whitelistMintEnabled = await contract[
          `${opts.whitelistMintFunction}Enabled`
        ]();

        if (updatedInfo.whitelistMintEnabled === true) {
          updatedInfo.status = "WhitelistOnly";
        }
      }

      switch (opts.supplyFunction) {
        case "totalSupply":
          if (updatedInfo.totalSupply === updatedInfo.maxSupply) {
            updatedInfo.status = "FinishedMinting";
          }
          break;

        case "reserveCount":
          if (updatedInfo.reserveCount === updatedInfo.reserveSupply) {
            updatedInfo.status = "FinishedMinting";
          }
          break;
      }
    }

    return updatedInfo;
  },

  async deleteAllTokens(tokens) {
    const limiter = new Bottleneck({
      minTime: 100,
      maxConcurrent: 5,
    });

    try {
      const tasks = tokens.map((token) =>
        limiter.schedule(() => {
          console.log(token.id);
          return strapi.entityService.delete(
            "api::token.token",
            Number(token.id)
          );
        })
      );
      const results = await Promise.all(tasks);
      return results;
    } catch (err) {
      limiter.stop();
      return {};
    }
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
