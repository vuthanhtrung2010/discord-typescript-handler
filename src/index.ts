import { Client, GatewayIntentBits, Partials } from "discord.js";
import { readdirSync } from "fs";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { init } from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
// import { Shard } from "discord-cross-hosting";

import { ClientVar } from "./handlers/clientvariables";
import { CommandManager } from "./handlers/commands";
import { DatabaseManager } from "./handlers/loaddb";
import { EventsManager } from "./handlers/events";

import { ExtendedClient } from "./types";
import "dotenv/config";
import { MuteHandler } from "./handlers/mutes";

(async () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildWebhooks,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildInvites,
    ],
    partials: [Partials.Channel],
    shards: getInfo().SHARD_LIST,
    shardCount: getInfo().TOTAL_SHARDS,
  }) as ExtendedClient;

  client.cluster = new ClusterClient(client);

  // client.machine = new Shard(client.cluster);

  client.la = {};

  const langs = readdirSync("./src/languages");
  for (const lang of langs.filter((file) => file.endsWith(".json"))) {
    client.la[`${lang.split(".json").join("")}`] = (
      await import(`./languages/${lang}`)
    ).default;
  }

  if (process.env.MODE && process.env.MODE === "production") {
    try {
      client.sentry = init({
        dsn: process.env.SENTRY_DNS_ADDRESS,
        integrations: [
          // Add our Profiling integration
          nodeProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, // Capture 100% of the transactions
        profilesSampleRate: 1.0,
        environment: "production",
      });
    } catch (e) {
      console.error(e);
    }
  }

  await ClientVar(client);
  await CommandManager(client);
  await DatabaseManager(client);
  await MuteHandler(client);
  await EventsManager(client);

  await client.login(process.env.TOKEN);
})();
