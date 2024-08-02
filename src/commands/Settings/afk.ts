import { EmbedBuilder } from "discord.js";
import { MessageCommand } from "../../types";
import es from "../../config/embed.json";
import chalk from "chalk";

export const Command: MessageCommand = {
  name: "afk",
  category: "Settings",
  aliases: ["awayfromkeyboard"],
  cooldown: 60,
  usage: "afk [TEXT]",
  description: "Set yourself AFK",
  type: "user",
  run: async (client, message, args, guild_settings) => {
    const current_date = Math.floor(Date.now() / 1000);

    try {
      await client.database?.afk.upsert({
        where: {
          userID_guildID: {
            userID: message.author.id,
            guildID: message.guild!.id,
          },
        },
        create: {
          userID: message.author.id,
          guildID: message.guild!.id,
          isAfk: true,
          message: args[0] ? args.join(" ") : "AFK",
          stamp: current_date,
        },
        update: {
          isAfk: true,
          message: args[0] ? args.join(" ") : "AFK",
          stamp: current_date,
        },
      });

      const afkEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("AFK Set")
        .setDescription(
          `<@${message.author.id}> You are now afk for: ${
            args[0] ? args.join(" ") : "AFK"
          }\n> **Tip:** *Write \`[afk]\` in front of your Message to stay afk but still write*`,
        );

      // Set the data to the caches
      client.caches?.set(`${message.guildId + message.author?.id}.afk`, {
        isAfk: true,
        message: args[0] ? args.join(" ") : "AFK",
        stamp: current_date,
      });

      return message.reply({ embeds: [afkEmbed] });
    } catch (e) {
      client.sentry?.captureException(e);
      console.log(chalk.grey.bgRed((e as Error).stack));
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setFooter({ text: es.footertext, iconURL: es.footericon })
            .setColor("#e01e01")
            .setTitle("Err Occured")
            .setDescription(`\`\`\`${(e as Error).stack}\`\`\``),
        ],
      });
    }
  },
};
