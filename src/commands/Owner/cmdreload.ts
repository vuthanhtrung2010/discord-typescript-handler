import chalk from "chalk";
import { ExtendedClient, MessageCommand } from "../../types";
import { EmbedBuilder } from "discord.js";
import path from "path";
import { v7 as uuidv7 } from "uuid";

export const Command: MessageCommand = {
  name: `cmdreload`,
  category: `Owner`,
  type: "info",
  aliases: [`commandreload`],
  description: `Reloads a command`,
  usage: `cmdreload <CMD>`,
  cooldown: 0,
  run: async (
    client: ExtendedClient,
    message: any, // Adjust `message` type as per your implementation
    args: string[],
    GuildSettings: any, // Adjust `GuildSettings` type as per your implementation
  ) => {
    try {
      const ls = GuildSettings?.language as string;
      if (!args[0])
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#e01e01")
              .setTitle(
                eval(
                  client.la?.[ls]["cmds"]["owner"]["cmdreload"]["variable2"],
                ),
              ),
          ],
        });

      let reload = false;
      const thecmd =
        client.commands?.get(args[0].toLowerCase()) ||
        client.commands?.get(
          client.aliases?.get(args[0].toLowerCase()) as string,
        );

      if (!thecmd)
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#e01e01")
              .setTitle(
                eval(
                  client.la?.[ls]["cmds"]["owner"]["cmdreload"]["variable3"],
                ),
              ),
          ],
        });

      // Construct module path
      const modulePath = path.resolve(
        `${process.cwd()}/src/commands/${thecmd.category}/${thecmd.name}.js`,
      );
      const uuid = uuidv7();
      // Re-import and set the command on all clusters
      const set = await client.cluster?.broadcastEval(
        async (client, { thecmd, modulePath, uuid }) => {
          (client as ExtendedClient).commands?.delete(thecmd.name);

          try {
            const { Command: pull }: { Command: MessageCommand } = await import(
              `${modulePath}?${uuid}=trung`
            );
            (client as ExtendedClient).commands?.set(thecmd.name, pull);

            if (pull.aliases && Array.isArray(pull.aliases)) {
              pull.aliases.forEach((alias: string) =>
                (client as ExtendedClient).aliases?.set(alias, thecmd.name),
              );
            }
          } catch (error) {
            console.error(`Error reloading command '${thecmd.name}':`, error);
          }
        },
        { context: { thecmd, modulePath, uuid } },
      );

      reload = true;

      if (set?.some((x: any) => x?.error)) {
        return message.reply(
          `Failed to reload on some shards...\n\`\`\`\n${String(set.find((x: any) => x?.error)).substring(0, 250)}\n\`\`\``,
        );
      }

      if (reload) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#0000ff")
              .setTitle(
                eval(
                  client.la?.[ls]["cmds"]["owner"]["cmdreload"]["variable4"],
                ),
              ),
          ],
        });
      }

      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#e01e01")
            .setTitle(
              eval(client.la?.[ls]["cmds"]["owner"]["cmdreload"]["variable5"]),
            )
            .setDescription("Cmd is now removed from the BOT COMMANDS!"),
        ],
      });
    } catch (e) {
      client.sentry?.captureException(e);
      console.log(chalk.dim.bgRed((e as Error).stack));
      const ls = GuildSettings?.language as string;
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#e01e01")
            .setTitle(client.la?.[ls].common.erroroccur)
            .setDescription(
              eval(client.la?.[ls]["cmds"]["owner"]["cmdreload"]["variable6"]),
            ),
        ],
      });
    }
  },
};
