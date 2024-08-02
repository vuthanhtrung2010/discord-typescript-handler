import chalk from "chalk";
import fetch from "node-fetch";
import { MessageCommand } from "../../types";
import { EmbedBuilder } from "discord.js";

export const Command: MessageCommand = {
  name: "npm",
  category: "Programming",
  aliases: ["npmpackage", "npmpkg", "nodepackagemanager"],
  cooldown: 4,
  usage: "npm <package>",
  description: "Search the NPM Registry for package information",
  run: async (client, message, args, GuildSettings) => {
    const ls = GuildSettings?.language as string;

    try {
      const pkg = args[0];
      if (!pkg) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#e01e01")
              .setTitle(
                client.la?.[ls]?.cmds?.programming?.npm?.variable1 ||
                  "Missing Package Name",
              )
              .setDescription(
                client.la?.[ls]?.cmds?.programming?.npm?.variable2 ||
                  "You must provide a package name.",
              ),
          ],
        });
      }

      const response = await fetch(`https://registry.npmjs.com/${pkg}`);
      if (!response.ok) {
        throw new Error("No results found.");
      }

      const body = (await response.json()) as NpmPackage;
      const version = body.versions[body["dist-tags"]?.latest] || "Unknown";

      let deps = version?.dependencies
        ? Object.keys(version.dependencies)
        : null;
      let maintainers = body.maintainers.map(
        (user: { name: string }) => user.name,
      );

      if (maintainers.length > 10) {
        maintainers = maintainers.slice(0, 10);
        maintainers.push(`...${maintainers.length - 10} more.`);
      }

      if (deps && deps.length > 10) {
        deps = deps.slice(0, 10);
        deps.push(`...${deps.length - 10} more.`);
      }

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              eval(client.la?.[ls]?.cmds?.programming?.npm?.variable3) ||
                "Package Information",
            )
            .setColor("#0099ff")
            .setURL(`https://npmjs.com/package/${pkg}`)
            .setAuthor({
              name: message.author.tag,
              iconURL: message.author.displayAvatarURL({ size: 64 }),
            })
            .setDescription(
              [
                body.description || "No Description.",
                `**Version:** ${body["dist-tags"].latest}`,
                `**License:** ${body.license}`,
                `**Author:** ${body.author ? body.author.name : "Unknown"}`,
                `**Modified:** ${new Date(body.time.modified).toDateString()}`,
                `**Dependencies:** ${deps && deps.length ? deps.join(", ") : "None"}`,
              ].join("\n"),
            ),
        ],
      });
    } catch (e) {
      client.sentry?.captureException(e);
      console.log(chalk.grey.bgRed((e as Error).stack));
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#e01e01")
            .setTitle(
              client.la?.[ls]?.common?.erroroccur || "An Error Occurred",
            )
            .setDescription(
              client.la?.[ls]?.cmds?.programming?.npm?.variable4 ||
                "An error occurred while fetching package information.",
            ),
        ],
      });
    }
  },
};

interface NpmPackage {
  name: string;
  description: string;
  "dist-tags": {
    latest: string;
  };
  versions: {
    [version: string]: {
      dependencies?: {
        [dependency: string]: string;
      };
    };
  };
  license: string;
  author?: {
    name: string;
  };
  maintainers: {
    name: string;
  }[];
  time: {
    modified: string;
  };
}
