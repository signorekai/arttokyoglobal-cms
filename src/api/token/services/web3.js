module.exports = ({ strapi }) => ({
  async readTokenMetadata(CID, file) {
    console.log(`reading ipfs://${CID}/${file}`);
  },
});
