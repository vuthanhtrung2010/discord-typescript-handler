import { Message } from "discord.js";
import { MessageCommand } from "../../types";

export const Command: MessageCommand = {
  name: "prefix",
  category: "Settings",
  usage: "prefix <string>",
  cooldown: 120,
  type: "bot",
  description: "Set a new prefix for your server",
  run: async (client, message, args, guild_settings): Promise<Message> => {
    if (!args[0]) return message.reply("Please provide a prefix");

    if (args[0].length > 10)
      return message.reply(`You cannot set a prefix over 10 characters!`);
    const data = await client.database?.setups.update({
      where: {
        serverID: message.guildId as string,
      },
      data: {
        prefix: args[0],
      },
      include: {
        moderation: true,
        commands: true,
      },
    });

    client.caches?.set(`${message.guildId as string}_settings`, data);
    return message.reply(
      `Successfully set the prefix to \`${args[0]}\` for your needs.`,
    );
  },
};
