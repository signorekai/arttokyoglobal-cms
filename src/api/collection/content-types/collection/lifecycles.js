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
        .service("api::collection.web3")
        .getABI(params.data.contractAddress);

      if (ABI) {
        const updates = await strapi
          .service("api::collection.web3")
          .readContract(params.data.contractAddress, ABI);

        event.params.data = {
          ...event.params.data,
          ABI,
          ...updates,
        };
      }
      event.state.changedContractAddress = true;
    }

    return event;
  },
  async afterUpdate(event) {
    const { state } = event;
    console.log("did contract change", state.changedContractAddress);
  },
};
