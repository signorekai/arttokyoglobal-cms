module.exports = {
  async beforeUpdate(event) {
    const { params } = event;
    const id = params.where.id;
    const entry = await strapi.entityService.findOne(
      "api::collection.collection",
      id
    );

    event.state.changedContractAddress =
      params.data.contractAddress &&
      entry.contractAddress !== params.data.contractAddress;

    return event;
  },
  async afterUpdate(event) {
    const { state, result } = event;
    if (state.changedContractAddress && result.contractAddress && result.CID) {
      const tokens = await strapi
        .service("api::token.web3")
        .fetchMetadataAndUpsert(result.CID, result.totalTokens, result);

      event.result.tokens = tokens;
    }
    return event;
  },
};
