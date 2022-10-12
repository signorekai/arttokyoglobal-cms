"use strict";

const Bottleneck = require("bottleneck");

/**
 * collection controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::collection.collection",
  ({ strapi }) => ({
    async fetchData(ctx) {
      const metadataUpdates = {};
      const result = await super.findOne(ctx);
      const { data } = result;

      const ABI = await strapi
        .service("api::collection.web3")
        .getABI(data.attributes.contractAddress);

      if (ABI) {
        const updates = await strapi
          .service("api::collection.web3")
          .readContract(data.attributes.contractAddress, ABI);

        metadataUpdates.data = {
          ABI,
          ...updates,
        };
      }

      const collectionUpdateRes = await strapi.entityService.update(
        "api::collection.collection",
        data.id,
        metadataUpdates
      );

      console.log(`${data.attributes.contractAddress} - collection updated`);

      if (collectionUpdateRes.CID) {
        collectionUpdateRes.tokenUpdates = await strapi
          .service("api::token.web3")
          .fetchMetadataAndUpsert(
            collectionUpdateRes.CID,
            data.attributes.totalTokens,
            { ...data.attributes, id: data.id }
          );
      }

      ctx.type = "application/json";
      ctx.body = JSON.stringify(collectionUpdateRes);
      // await strapi.entityService.update()
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
                .readContract(contractAddress, ABI);

              const results = await strapi.entityService.update(
                "api::collection.collection",
                collection.id,
                {
                  data: updatedContract,
                }
              );

              console.log(`${contractAddress} - collection updated`);

              if (results.CID) {
                strapi
                  .service("api::token.web3")
                  .fetchMetadataAndUpsert(
                    results.CID,
                    results.totalTokens,
                    results
                  );
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
