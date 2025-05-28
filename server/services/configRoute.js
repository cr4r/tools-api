// utils/configRoute.js

function rateLimitConfig({
  userLimit = 5,
  adminLimit = 50,
  timeWindow = "1 minute",
  message = "Terlalu banyak permintaan. Coba lagi nanti.",
} = {}) {
  return {
    rateLimit: {
      max: (req, key) => {
        const role = req.user?.role || "User";
        return role == "User" ? userLimit : adminLimit;
      },
      timeWindow,
      errorResponseBuilder: () => ({
        statusCode: 429,
        status: false,
        message,
      }),
    },
  };
}

module.exports = { rateLimitConfig };
