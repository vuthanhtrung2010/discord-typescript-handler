import { ColorResolvable, EmbedBuilder } from "discord.js";
import { MessageCommand } from "../../types";
import { evaluate } from "mathjs";
import es from "../../config/embed.json";
import { handlemsg } from "../../handlers/functions";

export const Command: MessageCommand = {
  name: "calc",
  aliases: ["calculate"],
  category: "School Commands",
  description: "Calculates a math equation",
  usage: "calc <INPUT>",
  type: "math",
  cooldown: 1,
  run: async (client, message, args, GuildSettings) => {
    const ls = GuildSettings?.language as string;

    if (args.length < 1)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(es.wrongcolor as ColorResolvable)
            .setTitle(
              eval(
                client.la?.[ls]["cmds"]["schoolcommands"]["calc"]["variable1"],
              ),
            )
            .setDescription(
              handlemsg(
                client.la?.[ls]["cmds"]["schoolcommands"]["calc"]["variable2"],
                {
                  prefix: GuildSettings?.prefix as string,
                },
              ),
            ),
        ],
      });

    let answer;

    try {
      answer = await evaluate(args.join(" "));
    } catch (err) {
      console.error(err);
      return message.reply({
        content: `Invalid Math Equation: \`\`\`${String((err as Error).message ? (err as Error).message : err).substring(0, 150)}\`\`\``,
      });
    }

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(es.color as ColorResolvable)
          .setThumbnail(client.user?.displayAvatarURL() as string)
          .setDescription(
            handlemsg(
              client.la?.[ls]["cmds"]["schoolcommands"]["calc"]["variable4"],
              {
                prefix: GuildSettings?.prefix as string,
              },
            ),
          )
          .addFields(
            {
              name: eval(
                client.la?.[ls]["cmds"]["schoolcommands"]["calc"][
                  "variablex_5"
                ],
              ),
              value: handlemsg(
                client.la?.[ls]["cmds"]["schoolcommands"]["calc"]["variable5"],
                {
                  expression: args.join(" "),
                },
              ),
            },
            {
              name: eval(
                client.la?.[ls]["cmds"]["schoolcommands"]["calc"][
                  "variablex_6"
                ],
              ),
              value: handlemsg(
                client.la?.[ls]["cmds"]["schoolcommands"]["calc"]["variable6"],
                {
                  answer: answer,
                },
              ),
            },
          ),
      ],
    });
  },
};
