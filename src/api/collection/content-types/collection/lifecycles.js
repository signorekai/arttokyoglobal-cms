module.exports = {
  async beforeUpdate(event) {
    const { params } = event;
    const id = params.where.id;
    const entry = await strapi.entityService.findOne(
      "api::collection.collection",
      id
    );

    event.state.changedContractAddress = false;

    if (entry.contractAddress !== params.data.contractAddress) {
      const ABI = await strapi
        .service("api::collection.alchemy")
        .getABI(params.data.contractAddress);

      if (ABI) {
        const updates = await strapi
          .service("api::collection.alchemy")
          .readContract(params.data.contractAddress, ABI);

        event.params.data = {
          ...event.params.data,
          ABI,
          ...updates,
        };
      }
    }

    return event;
  },
  async afterUpdate(event) {
    const { state } = event;
  },
};
