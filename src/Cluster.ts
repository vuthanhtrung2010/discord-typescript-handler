// import { Client } from "discord-cross-hosting";
import { ClusterManager } from "discord-hybrid-sharding";
import "dotenv/config";
import { dirname } from "path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// const client = new Client({
//   agent: "bot",
//   host: "localhost",
//   port: 3005,
//   authToken: "test_auth_token",
//   rollingRestarts: false, // Enable, when bot should respawn when cluster list changes.
// });

// client.connect();

const manager = new ClusterManager(`${__dirname}/index.ts`, {
  totalShards: "auto",
  totalClusters: "auto",
  token: process.env.TOKEN,
  execArgv: [...process.execArgv],
});
manager.on("clusterCreate", (cluster) =>
  console.log(`Launched Cluster ${cluster.id}`),
);
manager.on("debug", console.log);
manager.spawn({ timeout: -1 });

// client.listen(manager);
// client.on("ready", () => {
//   client
//     .requestShardData()
//     .then((e) => {
//       if (!e) return console.log("No shard data received");
//       manager.totalShards = e.totalShards;
//       manager.totalClusters = e.shardList.length;
//       manager.shardList = e.shardList;
//       manager.clusterList = e.clusterList;
//       manager.spawn({ timeout: -1 });
//     })
//     .catch((e) => console.log("error: ", e));
// });
