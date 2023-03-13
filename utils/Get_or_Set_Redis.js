// const redis = require("ioredis");
// const client = new redis({
//   port: process.env.REDIS_PORT,
//   host: process.env.REDIS_HOST,
//   password: process.env.REDIS_PASS,
// });

// const getOrSetRedis = (key, callback) => {
//   return new Promise((resolve, reject) => {
//     client.get(key, async (err, data) => {
//       if (err) return reject(err);
//       if (data !== null) {
//         return resolve(JSON.parse(data));
//       }
//       let result = await callback();
//       client.set(key, JSON.stringify(result));
//       resolve(result);
//     });
//   });
// };
// module.exports = { getOrSetRedis };
