"use strict";

/**
 * token controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::token.token", ({ strapi }) => ({
  async fetchData(ctx) {
    const entry = await super.findOne(ctx);
    const token = { id: entry.data.id, ...entry.data.attributes };

    const metadata = await strapi
      .service("api::token.web3")
      .fetchMetadata(...token.ipfsUri.split("/"));

    await strapi.service("api::token.web3").upsertMetadata(metadata);

    ctx.type = "application/json";
    ctx.body = JSON.stringify(metadata);
  },
}));
