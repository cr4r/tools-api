const root_path = process.env.ROOT_PATH;
const YoutubeModel = require(`${root_path}/models/tools`);

const {
  getReqParts,
  pecahString,
  handleServerResponse,
} = require(`${root_path}/middlewares`);
const { Info } = require("./info");

const youtube_get = async (req, reply) => {
  let info = await Info(req, reply);
  info.pesan = "Oke";
  return reply.send(info, { info });
};

const youtube_post = async (req, reply) => {};

const youtube_put = async (req, reply) => {};

const youtube_delete = async (req, reply) => {};

module.exports = {
  youtube_get,
  youtube_post,
  youtube_put,
  youtube_delete,
};
