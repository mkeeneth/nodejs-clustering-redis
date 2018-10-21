var redis = require("redis");

var port = process.env.REDIS_PORT || 6379;
var host = process.env.REDIS_HOST || "127.0.0.1";
const password = process.env.password || "";

const client = redis.createClient(port, host);
client.auth(password);
module.exports = client;
