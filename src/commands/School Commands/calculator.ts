import { ColorResolvable } from "discord.js";
import { MessageCommand } from "../../types";
import { Calculator } from "@m3rcena/weky";
import es from "../../config/embed.json";

export const Command: MessageCommand = {
  name: "calculator",
  aliases: ["ti82", "taschenrechner"],
  category: "School Commands",
  description: "Allows you to use a calculator",
  usage: "calc",
  type: "math",
  cooldown: 5,
  run: async (client, message, args, GuildSettings): Promise<void> => {
    await Calculator({
      client: client,
      embed: {
        title: "Calculator",
        color: es.color as ColorResolvable,
      },
      disabledQuery: "Calculator got disabled!",
      invalidQuery: "The provided equation is invalid!",
      interaction: message,
    });
  },
};
