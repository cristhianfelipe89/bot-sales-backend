// src/middleware/checkSecret.js
export const checkSecret = (req, res, next) => {
  if (!process.env.API_TOOL_SECRET) {
    console.warn("API_TOOL_SECRET not set - allowing request (not recommended)");
    return next();
  }
  const secret = req.headers["x-api-secret"] || req.body?.apiSecret;
  if (!secret || secret !== process.env.API_TOOL_SECRET) return res.status(401).json({ msg: "Invalid API Secret" });
  next();
};
