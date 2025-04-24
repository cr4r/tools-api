const UserRoutes = require("./users");
const toolRoutes = require("./tools");

module.exports = {
  ...UserRoutes,
  ...toolRoutes,
};
