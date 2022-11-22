const fetch = require("node-fetch");
const Bottleneck = require("bottleneck");
const FormData = require("form-data");

module.exports = ({ strapi }) => ({
  parseTokenMetadata(data) {
    return {
      minted: data.minted,
      ipfsUri: data.fileName,
      title: data.name,
      tokenAttributes: data.rarity ? data.rarity.traits : data.attributes,
      tokenId: `${data.token_id}`,
      mediaIpfsUri: data.image.substring(7),
    };
  },
  getLimiter() {
    const limiter = new Bottleneck({
      minTime: 100,
      maxConcurrent: 5,
    });
    return limiter;
  },
  async downloadImageAndUpload(path, fileName) {
    console.log("Downloading", path);
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    const img = Buffer.from(arrayBuffer);

    var form = new FormData();
    form.append("files", img, fileName);

    const formResponse = await fetch(`${process.env.CLIENT_URL}/api/upload`, {
      method: "post",
      headers: {
        Authorization: `Bearer ${process.env.UPLOAD_TOKEN}`,
      },
      body: form,
    });

    if (formResponse.status !== 200) {
      console.log(formResponse.status, formResponse.statusText);
    }

    const uploaded = await formResponse.json();

    return uploaded;
  },
  // async fetchMetadataAndUpsert(CID, limit, collection) {
  async fetchMetadataAndUpsert({ CID, limit, collection }) {
    try {
      const tokensMetadata = await strapi
        .service("api::token.web3")
        .fetchAllMetadata(CID, limit);

      const limiter = await strapi.service("api::token.web3").getLimiter();

      const promises = tokensMetadata.map((metadata) => {
        metadata.minted = Number(metadata.token_id) <= collection.totalSupply;

        return limiter.schedule(
          () =>
            new Promise(async (resolve) => {
              if (metadata && metadata.ok) {
                const result = await strapi
                  .service("api::token.web3")
                  .upsertMetadata(metadata, collection.id);
                return resolve(result);
              } else {
                return resolve({ success: false, ...metadata });
              }
            })
        );
      });

      const updatedTokens = await Promise.all(promises);

      return updatedTokens;
    } catch (err) {
      console.error(err);
    }
  },
  async fetchAllMetadata(CID, limit) {
    console.log(`${CID} - getting all ${limit} JSONs`);

    // follow rate limits of Pinata's Public Gateway
    const limiter = new Bottleneck({
      minTime: 100,
      maxConcurrent: 4,
    });

    const files = [];
    for (var x = 1; x <= limit; x++) {
      files.push(`${x}.json`);
    }

    // @todo try fetching _metadata.json first

    try {
      const tasks = files.map((file) =>
        limiter.schedule(() =>
          strapi.service("api::token.web3").fetchMetadata(CID, file)
        )
      );

      const results = await Promise.all(tasks);
      return results;
    } catch (err) {
      limiter.stop();
      return {};
    }
    // console.log(CID, results.length);
  },
  async fetchMetadata(CID, file) {
    const gateway = process.env.IPFS_GATEWAY;
    console.log(`ipfs://${CID}/${file}`);

    const result = await fetch(`${gateway}/ipfs/${CID}/${file}`);
    let json = {};

    if (result.ok) {
      json = await result.json();
      json.ok = true;
    } else {
      json.ok = false;
      throw new Error(
        `Cannot fetch ${gateway}/ipfs/${CID}/${file} - ${result.status}`
      );
    }

    json.fileName = `${CID}/${file}`;

    return json;
  },

  async upsertMetadata(data, collectionId = 0) {
    const existingToken = await strapi.entityService.findMany(
      "api::token.token",
      {
        filters: {
          ipfsUri: {
            $eq: data.fileName,
          },
        },
      }
    );
    const updateData = {
      cachedData: data,
    };

    if (collectionId !== 0) {
      updateData.collection = Number(collectionId);
    }

    let result = {};
    if (existingToken.length === 0) {
      // token doesn't exist, create new!
      result = await strapi.entityService.create("api::token.token", {
        populate: ["collection"],
        data: updateData,
      });
    } else {
      // token already exist, update!
      result = await strapi.entityService.update(
        "api::token.token",
        existingToken[0].id,
        {
          populate: ["collection"],
          data: updateData,
        }
      );
    }
    return result;
  },
});
