import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable, EmbedBuilder } from "discord.js";
import { MessageCommand } from "../../types";
import ee from "../../config/embed.json";

export const Command: MessageCommand = {
    name: "support",
    category: "Info",
    usage: "support -> Click on the link",
    description: "Sends you the Support Server Link",
    type: "bot",
    cooldown: 20,
    run: async (client, message, args, GuildSettings) => {
        const ls = GuildSettings?.language as string;

        const button_public_invite = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setEmoji("959282186832453674")
            .setLabel("Invite me")
            .setURL(
                `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=8&scope=bot%20applications.commands`,
            );
        const button_support_dc = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setEmoji("948483018081841162")
            .setLabel("Support Server")
            .setURL("https://discord.gg/5q6zxM5vnT");
        const allButtons = [new ActionRowBuilder<ButtonBuilder>().addComponents([button_public_invite, button_support_dc])]

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(ee.color as ColorResolvable)
                    .setTitle(client.la?.[ls].cmds.info.support.title)
                    .setDescription(
                        `  •  [Support Discord](https://discord.gg/5q6zxM5vnT)\n  •  [Website / Status](https://status.trung.is-a.dev)\n  •  [Invite](https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=8&scope=bot%20applications.commands)`,
                    )
                    .setURL(
                        "https://discord.com/api/oauth2/authorize?client_id=1142278243131592754&permissions=8&scope=bot%20applications.commands",
                    ),
            ],
            components: allButtons
        })
    }
}