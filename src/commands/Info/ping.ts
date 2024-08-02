import chalk from "chalk";
import { MessageCommand } from "../../types";
import { EmbedBuilder } from "discord.js";
import { calcProcessDurationTime } from "../../handlers/functions";
import https from "https";

export const Command: MessageCommand = {
  name: "ping",
  category: "Info",
  aliases: ["latency"],
  cooldown: 2,
  usage: "ping",
  description: "Gives you information on how fast the Bot can respond to you",
  type: "bot",
  run: async (client, message, args, guild_settings): Promise<any> => {
    try {
      message
        .reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#0000ff")
              .setTitle(
                client.la?.[guild_settings?.language as string].cmds.info.ping
                  .m1,
              ),
          ],
        })
        .then(async (msg) => {
          const beforeTime = process.hrtime();
          await client.database?.setups.findFirst({
            take: -1,
          });
          const dbping = calcProcessDurationTime(beforeTime, false);
          console.log(
            chalk.redBright(`[${dbping}ms] | "ping" | DB PING RECEIVED`),
          );
          const latencyToDiscord = await getLatency();
          msg
            .edit({
              embeds: [
                new EmbedBuilder().setColor("#0000ff").addFields(
                  {
                    name: client.la?.[guild_settings?.language as string].cmds
                      .info.ping.field1,
                    value: `> \`\`\`${client.ws.ping}ms\`\`\``,
                    inline: true,
                  },
                  {
                    name: client.la?.[guild_settings?.language as string].cmds
                      .info.ping.field2,
                    value: `> \`\`\`${latencyToDiscord}ms\`\`\``,
                    inline: true,
                  },
                  {
                    name: client.la?.[guild_settings?.language as string].cmds
                      .info.ping.field3,
                    value: `> \`\`\`${client.ws.ping}ms\`\`\``,
                    inline: true,
                  },
                  {
                    name: client.la?.[guild_settings?.language as string].cmds
                      .info.ping.field4,
                    value: `> \`\`\`${dbping}ms\`\`\``,
                    inline: true,
                  },
                ),
              ],
            })
            .catch(console.error);
        });
    } catch (e) {
      client.sentry?.captureException(e);
      console.log(chalk.grey.bgRed((e as Error).stack));
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#e01e01")
            .setTitle(
              client.la?.[guild_settings?.language as string].common.erroroccur,
            )
            .setDescription(
              eval(
                client.la?.[guild_settings?.language as string]["cmds"]["info"][
                  "color"
                ]["variable2"],
              ),
            ),
        ],
      });
    }
  },
};

function getLatency() {
  const beforeTime = process.hrtime();
  const protocol = https;

  const options = {
    method: "HEAD",
    hostname: "discord.com",
  };

  return new Promise((resolve, reject) => {
    const req = protocol.request(options, (res) => {
      res.on("data", () => {}); // consume response data to end the request
      res.on("end", () => {
        const time = calcProcessDurationTime(beforeTime, false);
        console.log(`Latency to discord.com is ${time}ms`);
        resolve(time); // Resolve with the calculated time
      });
    });

    req.on("error", (err) => {
      console.error(`Error: ${err.message}`);
      reject(err); // Reject if there's an error
    });

    req.end();
  });
}
