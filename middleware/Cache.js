const setCache = (req, res, next) => {
  res.set("Cache-Control", "public, max-age=300, s-maxage=600");
  next();
};
module.exports = setCache;
