const ModelUser = require("./users");
const ModelTools = require("./tools");

module.exports = {
  ...ModelUser,
  ...ModelTools,
};
