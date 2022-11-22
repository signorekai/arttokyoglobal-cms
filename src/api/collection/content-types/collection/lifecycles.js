const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");

module.exports = {
  async beforeUpdate(event) {
    const { data, where } = event.params;
    const { id } = where;
    const entry = await strapi.entityService.findOne(
      "api::collection.collection",
      id
    );

    if (
      data.contractAddress &&
      entry.contractAddress !== data.contractAddress
    ) {
      const ABI = await strapi
        .service("api::collection.web3")
        .getABI(data.contractAddress);
      if (ABI) {
        const updates = await strapi
          .service("api::collection.web3")
          .readContract(data.contractAddress, ABI);

        event.params.data = {
          ...data,
          ABI,
          ...updates,
        };
      }

      const tokens = await strapi
        .service("api::token.web3")
        .fetchMetadataAndUpsert({
          CID: entry.CID,
          limit: entry.totalTokens,
          collection: entry,
        });

      const tokenIDs = tokens.map((token) => token.id);

      data.tokens = tokenIDs;
    }

    return event;
  },
  async beforeCreate(event) {
    const { data } = event.params;
    const ABI = await strapi
      .service("api::collection.web3")
      .getABI(data.contractAddress);
    if (ABI) {
      const updates = await strapi
        .service("api::collection.web3")
        .readContract(data.contractAddress, ABI);

      event.params.data = {
        ...data,
        ABI,
        ...updates,
      };
    }

    if (!data.slug) {
      event.params.data.slug = `${slugify(event.params.data.title, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
      })}-${uuidv4()}`;
    }

    return event;
  },
  async afterCreate(event) {
    const { result: entry } = event;

    if (entry.CID && entry.CID.length > 0) {
      const tokens = await strapi
        .service("api::token.web3")
        .fetchMetadataAndUpsert({
          CID: entry.CID,
          limit: entry.totalTokens,
          collection: entry,
        });

      event.result.tokens = tokens;
    }

    return event;
  },
  async afterUpdate(event) {
    const { state, result } = event;
    return event;
  },
};
