const UserRoutes = require("./user");
const toolRoutes = require("./tools");

module.exports = {
  ...UserRoutes,
  ...toolRoutes,
};
