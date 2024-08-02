import { MessageCommand } from "../../types";
import { STATUS_CODES } from "http";
import { EmbedBuilder } from "discord.js";
import chalk from "chalk";

export const Command: MessageCommand = {
  name: "httpstatus",
  category: "Programming",
  aliases: [""],
  cooldown: 4,
  usage: "httpstatus <status>",
  description: "Show httpstatus with a meme.",
  run: async (client, message, args, GuildSettings) => {
    const ls = GuildSettings?.language as string;

    try {
      const status: undefined | string | null = args[0];
      if (!status)
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#e01e01")
              .setTitle(
                eval(
                  client.la?.[ls]["cmds"]["programming"]["httpstatus"][
                    "variable1"
                  ],
                ),
              )
              .setDescription(
                eval(
                  client.la?.[ls]["cmds"]["programming"]["httpstatus"][
                    "variable2"
                  ],
                ),
              ),
          ],
        });

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              client.la?.[ls]["cmds"]["programming"]["httpstatus"]["variable4"],
            )
            .setImage(`https://http.cat/${status}.jpg`)
            .setDescription(
              status === "599"
                ? "Network Connect Timeout Error"
                : (STATUS_CODES[status] as string),
            )
            .setAuthor({
              name: message.author.tag,
              iconURL: message.author.displayAvatarURL({ size: 1024 }),
            }),
        ],
      });
    } catch (e) {
      client.sentry?.captureException(e);
      console.log(chalk.grey.bgRed((e as Error).stack));
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#e01e01")
            .setTitle(client.la?.[ls].common.erroroccur)
            .setDescription(
              eval(
                client.la?.[ls]["cmds"]["programming"]["httpstatus"][
                  "variable5"
                ],
              ),
            ),
        ],
      });
    }
  },
};
//-CODED-BY-trungisreal-//
