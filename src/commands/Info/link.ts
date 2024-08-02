import { MessageCommand } from "../../types";
import { EmbedBuilder } from "discord.js";

export const Command: MessageCommand = {
  name: "links",
  category: "Info",
  aliases: ["link"],
  cooldown: 3,
  usage: "links",
  description: "Get all related to help/links",
  type: "user",
  run: async (client, message, args, guild_settings) => {
    const linksEmbed = new EmbedBuilder().addFields(
      {
        name: "Links",
        value:
          ">>> <:website:1214162849400889346> [Website](https://trung.is-a.dev)\n<:support:1214163017751855154> [Support](https://discord.gg/HcgTkh37d3)\n<:paypal:982637871091552276> [Donate us!](https://paypal.me/trungdev)",
      },
      {
        name: "Important",
        value:
          ">>> <:docs:1210181258491994143> [Docs](https://docs.trung.is-a.dev)\n<:ToS:1214162144883515392> [Terms of Service](https://docs.trung.is-a.dev/terms-of-service)\n<:Privacy_Policy:1214162642663645234> [Privacy Policy](https://docs.trung.is-a.dev/privacy-policy)",
      },
    );
    message.reply({ embeds: [linksEmbed] });
  },
};
