"use strict";

/**
 * collection controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::collection.collection",
  ({ strapi }) => ({
    async fetchData(ctx, next) {
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

      const promises = collections.map((collection) => {
        return new Promise((resolve, reject) => {
          const { contractAddress, ABI } = collection;
          console.log(`Fetching ${collection.contractAddress}`);
          strapi
            .service("api::collection.web3")
            .readContract(contractAddress, ABI)
            .then((updatedContract) =>
              strapi.entityService.update(
                "api::collection.collection",
                collection.id,
                {
                  data: updatedContract,
                }
              )
            )
            .then((results) => {
              console.log(
                `Updated ${results.id} with ${results.contractAddress}`
              );
              resolve(results);
            })
            .catch((err) => reject(err));
        });
      });

      const updated = await Promise.all(promises);

      try {
        ctx.type = "application/json";
        ctx.body = JSON.stringify(updated);
      } catch (err) {
        ctx.body = err;
      }
      next();
    },
  })
);
