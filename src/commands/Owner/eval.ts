import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { MessageCommand } from "../../types";
import { inspect } from "util";
import chalk from "chalk";
import { writeFile, unlink } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

export const Command: MessageCommand = {
  name: "eval",
  category: "Owner",
  usage: "eval <Code>",
  cooldown: 0,
  description: "Evaluate a TypeScript code.",
  run: async (client, message, args, guild_settings): Promise<any> => {
    if (!args[0])
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("Missing required parameters.")
            .setDescription(
              "Please add a <:typescript:1241728952448323585> code to eval!",
            ),
        ],
      });

    let evaled;
    try {
      if (args.join(` `).includes(`token`))
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Trung | Evaluation")
              .setColor("Blue")
              .addFields(
                { name: ":inbox_tray: Input", value: args.join(` `) },
                {
                  name: ":outbox_tray: Output",
                  value: "```[CENSORED_BOT_TOKEN]```",
                },
              ),
          ],
        });

      evaled = inspect(await eval(args.join(" ")), { depth: 0 });

      // Make string out of the evaluation

      // Use substring instead of split for output
      const input_msg = `\`\`\`js\n${args.join(` `).substring(0, 1024 - ":inbox_tray: Input".length - 8)}\`\`\``;
      let output_msg = `\`\`\`${evaled}\`\`\``;
      let fileAttachment;
      if (evaled.length > 1024 - ":outbox_tray: Output".length - 6) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const filePath = join(__dirname, "eval_output.txt");
        await writeFile(filePath, evaled, "utf8");
        fileAttachment = new AttachmentBuilder(filePath);
        output_msg = `\`\`\`CHECK THE FILE\`\`\``;

        const evalEmbed = new EmbedBuilder()
          .setTitle("Trung | Evaluation")
          .setColor("Blue")
          .addFields(
            { name: ":inbox_tray: Input", value: input_msg },
            {
              name: ":outbox_tray: Output",
              value: output_msg,
            },
          );

        await message.channel.send({
          embeds: [evalEmbed],
          files: [fileAttachment],
        });

        // Delete the file after sending the message
        await unlink(filePath);
        return;
      }

      const evalEmbed = new EmbedBuilder()
        .setTitle("Trung | Evaluation")
        .setColor("Blue")
        .addFields(
          { name: ":inbox_tray: Input", value: input_msg },
          {
            name: ":outbox_tray: Output",
            value: output_msg,
          },
        );

      return message.channel.send({ embeds: [evalEmbed] });
    } catch (e) {
      client.sentry?.captureException(e);
      console.log(chalk.dim.bgRed((e as Error).stack));
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("An error occurred")
            .setDescription(`Error: ${(e as Error).stack}`),
        ],
      });
    }
  },
};
