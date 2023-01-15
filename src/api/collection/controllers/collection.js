"use strict";

const Bottleneck = require("bottleneck");

/**
 * collection controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::collection.collection",
  ({ strapi }) => ({
    async checkWhitelist(ctx) {
      const result = await super.findOne(ctx);
      const { address } = ctx.params;
      const { data } = result;
      const { whitelistedAddresses } = data.attributes;

      const results = await strapi
        .service("api::collection.web3")
        .checkWhitelist(whitelistedAddresses, address);

      ctx.type = "application/json";
      ctx.body = JSON.stringify(results);
    },
    async fetchData(ctx) {
      const metadataUpdates = {};
      const result = await super.findOne(ctx);
      const { data } = result;
      const { ABI, contractAddress } = data.attributes;

      if (ABI) {
        const updates = await strapi
          .service("api::collection.web3")
          .readContract(contractAddress, ABI, {
            whitelistMintFunction: data.attributes.whitelistMintFunction,
            supplyFunction: data.attributes.supplyFunction,
            overwriteDescription:
              typeof data.description === "undefined" ||
              data.description.length === 0,
          });

        metadataUpdates.data = {
          ...updates,
        };
      }

      const collectionUpdateRes = await strapi.entityService.update(
        "api::collection.collection",
        data.id,
        metadataUpdates
      );

      console.log(`${data.attributes.contractAddress} - collection updated`);

      ctx.type = "application/json";
      ctx.body = JSON.stringify(collectionUpdateRes);
    },
    async fetchABI(ctx) {
      const updates = {};
      const result = await super.findOne(ctx);
      const { data } = result;
      const { contractAddress } = data.attributes;

      const ABI = await strapi
        .service("api::collection.web3")
        .getABI(data.attributes.contractAddress);

      if (ABI) {
        const updatedInfo = await strapi
          .service("api::collection.web3")
          .readContract(contractAddress, ABI, {
            whitelistMintFunction: data.attributes.whitelistMintFunction,
            supplyFunction: data.attributes.supplyFunction,
          });

        updates.data = {
          ...updatedInfo,
          ABI,
        };
      }

      const collectionUpdateRes = await strapi.entityService.update(
        "api::collection.collection",
        data.id,
        updates
      );

      console.log(`${data.attributes.contractAddress} - collection updated`);

      ctx.type = "application/json";
      ctx.body = JSON.stringify(collectionUpdateRes);
      // await strapi.entityService.update()
    },
    async fetchAllTokens(ctx) {
      const result = await super.findOne(ctx);
      const { data } = result;
      const { CID, totalTokens } = data.attributes;
      let updates = { success: false };

      if (CID) {
        updates = await strapi
          .service("api::token.web3")
          .fetchMetadataAndUpsert({
            CID,
            limit: totalTokens,
            collection: {
              ...data.attributes,
              id: data.id,
            },
          });
      }

      ctx.type = "application/json";
      ctx.body = JSON.stringify(updates);
    },
    async deleteAllTokens(ctx) {
      const entry = await strapi.entityService.findOne(
        "api::collection.collection",
        ctx.params.id,
        {
          populate: ["tokens"],
        }
      );
      const { tokens } = entry;

      const results = await strapi
        .service("api::collection.web3")
        .deleteAllTokens(tokens);
      ctx.type = "application/json";
      ctx.body = JSON.stringify(results);
    },
    async fetchAllData(ctx) {
      const collections = await strapi.entityService.findMany(
        "api::collection.collection",
        {
          filters: {
            contractAddress: {
              $notNull: true,
            },
          },
        }
      );

      const limiter = new Bottleneck({
        minTime: 333,
        maxConcurrent: 1,
      });

      const promises = collections.map((collection) => {
        return limiter.schedule(
          () =>
            new Promise(async (resolve, reject) => {
              const { contractAddress, ABI } = collection;
              console.log(`${collection.contractAddress} - fetching`);
              const updatedContract = await strapi
                .service("api::collection.web3")
                .readContract(contractAddress, ABI, {
                  whitelistMintFunction: collection.whitelistMintFunction,
                  supplyFunction: collection.supplyFunction,
                });

              const results = await strapi.entityService.update(
                "api::collection.collection",
                collection.id,
                {
                  data: updatedContract,
                }
              );

              console.log(`${contractAddress} - collection updated`);

              if (results.CID) {
                await strapi.service("api::token.web3").fetchMetadataAndUpsert({
                  CID: results.CID,
                  limit: results.totalTokens,
                  collection: results,
                });
              }

              console.log(
                `Updated ${results.id} with ${results.contractAddress}`
              );
              resolve(results);
            })
        );
      });

      const updated = await Promise.all(promises);

      try {
        ctx.type = "application/json";
        ctx.body = JSON.stringify(updated);
      } catch (err) {
        ctx.body = err;
      }
    },
  })
);
