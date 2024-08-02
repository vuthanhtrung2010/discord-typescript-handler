import { Bridge } from "discord-cross-hosting";
import "dotenv/config";

const server = new Bridge({
  port: 3005,
  authToken: "test_auth_token",
  totalShards: "auto",
  totalMachines: 1,
  shardsPerCluster: 10,
  token: process.env.TOKEN,
});

server.on("debug", console.log);
server.start();

server.on("ready", (url) => {
  console.log("Server is ready" + url);
  setInterval(() => {
    server.broadcastEval("this.guilds.cache.size").then((e) => console.log(e));
  }, 10000);
});
