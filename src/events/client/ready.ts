import chalk from "chalk";
import moment from "moment";
import { generateInvitesCache, nFormatter } from "../../handlers/functions";
import config from "../../config/config.json";
import { ClientEvent, ExtendedClient } from "../../types";
import { ActivityType, PermissionsBitField, version } from "discord.js";

const logBanner = (stringLength: number, client: ExtendedClient): void => {
  console.log(
    chalk.bold.greenBright(`
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃ ${" ".repeat(stringLength - 4)}┃
        ┃ ${chalk.bold.greenBright(`Discord Bot is online!`)}${" ".repeat(stringLength - 20 - ` ┃ `.length)}┃
        ┃ ${`/--/ ${client.user?.tag} /--/ `}${" ".repeat(stringLength - 10 - ` /--/ ${client.user?.tag} /--/ `.length)}┃
        ┃ ${" ".repeat(stringLength - 4)}┃
        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    `),
  );
};

export const Event: ClientEvent = {
  name: "ready",
  run: async (client): Promise<void> => {
    try {
      const stringLength = 69;
      console.log("\n");
      logBanner(stringLength, client);

      console.table({
        "Cluster:": `#${client.cluster?.id}`,
        "Shards:": `${client.cluster?.ids.map((d: { id: number }) => `#${d.id}`).join(", ")}`,
        "Bot User:": `${client.user?.tag}`,
        "Guild(s):": `${client.guilds.cache.size} Servers`,
        "Watching:": `${client.guilds.cache.reduce((a: number, b: { memberCount: number }) => a + b?.memberCount || 0, 0)} Members`,
        "Prefix:": `${config.prefix}`,
        "Commands:": `${client.commands?.size}`,
        "Discord.js:": `v${version}`,
        "Node.js:": `${process.version}`,
        "Platform:": `${process.platform} ${process.arch}`,
        "Memory:": `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
      });

      changeStatus(client);
      await FetchInvite(client);

      // const results = await client.machine?.broadcastEval(
      //   `this.guilds.cache.size`,
      // );
      // console.log(results);

      setInterval(() => {
        changeStatus(client);
      }, 90 * 1000);
    } catch (e) {
      client.sentry?.captureException(e);
      console.error(chalk.red(`Error initializing bot: ${e}`));
    }
  },
};
let state = false;

async function changeStatus(client: ExtendedClient): Promise<void> {
  try {
    const stats = await client.database?.stats.findUnique({
      where: {
        datasource: "global",
      },
    });

    if (!state) {
      for (const id of client.cluster?.ids.map((s: { id: number }) => s.id)) {
        client.user?.setPresence({
          activities: [
            {
              name: `on Cluster: #${client.cluster?.id}, Shard: #${id}`
                .replace("{prefix}", config.prefix)
                .replace(
                  "{guildcount}",
                  nFormatter(client.guilds.cache.size, 2),
                )
                .replace(
                  "{membercount}",
                  nFormatter(
                    client.guilds.cache.reduce((a, b) => a + b?.memberCount, 0),
                    2,
                  ),
                )
                .replace(
                  "{created}",
                  moment(client.user?.createdTimestamp).format("DD/MM/YYYY"),
                )
                .replace(
                  "{createdime}",
                  moment(client.user?.createdTimestamp).format("HH:mm:ss"),
                )
                .replace("{name}", client.user?.username)
                .replace("{tag}", client.user?.tag)
                .replace("{commands}", String(client.commands?.size))
                .replace(
                  "{usedcommands}",
                  nFormatter(
                    Math.ceil(
                      ((stats?.commands as number) *
                        [...client.guilds.cache.values()].length) /
                        10,
                    ),
                    2,
                  ),
                )
                .replace(
                  "{songsplayed}",
                  nFormatter(
                    Math.ceil(
                      ((stats?.songs as number) *
                        [...client.guilds.cache.values()].length) /
                        10,
                    ),
                    2,
                  ),
                ),
              type: ActivityType.Custom,
            },
          ],
        });
      }
    }
    state = !state;
  } catch (error) {
    console.error(chalk.red(`Error changing status: ${error}`));
  }
}

async function FetchInvite(client: ExtendedClient) {
  for await (const guild of [...client.guilds.cache.values()]) {
    try {
      let fetchedInvites = null;
      if (
        guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageGuild)
      ) {
        await guild.invites.fetch().catch(() => null);
      }
      fetchedInvites = generateInvitesCache(guild.invites.cache);
      if (!client.invitations) client.invitations = {};
      client.invitations[guild.id] = fetchedInvites;
    } catch (e) {
      console.error(e);
    }
  }
  client.fetched = true;
}
