const optionCookie = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd, // ✅ HTTPS only in production
    // secure: true, // ✅ HTTPS only in production
    sameSite: isProd ? "None" : "Lax", // "lax" atau "Strict" kalo bisa
    // sameSite: "None", // "lax" atau "Strict" kalo bisa
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  };
};

module.exports = {
  optionCookie,
};
