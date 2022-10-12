module.exports = {
  async beforeUpdate(event) {
    console.log("before update");
    const { params } = event;
    const id = params.where.id;
    const entry = await strapi.entityService.findOne(
      "api::collection.collection",
      id
    );

    event.state.changedContractAddress = false;

    if (
      params.data.contractAddress &&
      entry.contractAddress !== params.data.contractAddress
    ) {
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
    const { state, result } = event;
    console.log("after update");
    if (state.changedContractAddress && result.contractAddress && result.CID) {
      console.log(`REFETCHING TOKEN METADATA!`);
      await strapi
        .service("api::token.web3")
        .fetchMetadataAndUpsert(result.CID, result.totalTokens, result);
    }
    console.log("did contract change", state.changedContractAddress);
  },
};
