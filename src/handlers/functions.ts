import chalk from "chalk";
import { prefix } from "../config/config.json";
import { Payload, ExtendedClient, guild_data, InviteJson } from "../types";
import {
  ActionRow,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  ComponentType,
  EmbedBuilder,
  Guild,
  GuildMember,
  Invite,
  Message,
  MessageActionRowComponent,
  User,
} from "discord.js";
import emoji from "../config/emojis.json";

export function duration(duration: number, useMilli: boolean = false) {
  let remain = duration;
  const days = Math.floor(remain / (1000 * 60 * 60 * 24));
  remain = remain % (1000 * 60 * 60 * 24);
  const hours = Math.floor(remain / (1000 * 60 * 60));
  remain = remain % (1000 * 60 * 60);
  const minutes = Math.floor(remain / (1000 * 60));
  remain = remain % (1000 * 60);
  const seconds = Math.floor(remain / 1000);
  remain = remain % 1000;
  const milliseconds = remain;
  const time = {
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
  };
  const parts = [];
  if (time.days) {
    let ret = time.days + " Day";
    if (time.days !== 1) {
      ret += "s";
    }
    parts.push(ret);
  }
  if (time.hours) {
    let ret = time.hours + " Hr";
    if (time.hours !== 1) {
      ret += "s";
    }
    parts.push(ret);
  }
  if (time.minutes) {
    let ret = time.minutes + " Min";
    if (time.minutes !== 1) {
      ret += "s";
    }
    parts.push(ret);
  }
  if (time.seconds) {
    let ret = time.seconds + " Sec";
    if (time.seconds !== 1) {
      ret += "s";
    }
    parts.push(ret);
  }
  if (useMilli && time.milliseconds) {
    const ret = time.milliseconds + " ms";
    parts.push(ret);
  }
  if (parts.length === 0) {
    return ["instantly"];
  } else {
    return parts;
  }
}

export async function delay(delayInms: number) {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(2);
      }, delayInms);
    });
  } catch (e) {
    console.log(chalk.grey.bgRed((e as Error).stack));
  }
}

export function calcProcessDurationTime(
  beforeHRTime: [number, number],
  format: boolean,
) {
  const timeAfter = process.hrtime(beforeHRTime);
  const calculated =
    Math.floor((timeAfter[0] * 100000000 + timeAfter[1]) / 10000) / 100;
  return format ? duration(calculated, true).join(", ") : calculated;
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}

export async function checkGuild(client: ExtendedClient, serverID: string) {
  let result;
  if (!serverID) return;
  try {
    // Attempt to find an existing setup with the given serverID
    result = await client.database?.setups.findUnique({
      where: {
        serverID: serverID,
      },
      include: {
        moderation: true,
        commands: true,
      },
    });

    // If no setup exists, create a new one
    if (!result) {
      result = await client.database?.setups.create({
        data: {
          serverID: serverID,
          prefix: prefix, // Make sure `prefix` is defined somewhere
          logsChannel: "",
          moderation: {
            create: {
              guildID: serverID,
              muterole: "",
              AntiScamURL: true,
              DefaultMuteDuration: 604800000,
            },
          },
          commands: {
            create: {
              guildID: serverID,
              Economy: true,
              School: true,
              Music: true,
              Filter: true,
              Programming: true,
              Ranking: true,
              Voice: true,
              Fun: true,
              Minigames: true,
              CustomQueue: true,
              Anime: true,
            },
          },
        },
        include: {
          moderation: true,
          commands: true,
        },
      });
    }
  } catch (error) {
    console.error("Error creating or retrieving setup:", error);
    throw error;
  }

  return result;
}

export async function rawEmbed(
  client: ExtendedClient,
  payload: Payload,
  channelId: string,
) {
  await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${client.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function handlemsg(txt: string, options: { [key: string]: string }) {
  let text = String(txt);
  for (const option in options) {
    const toreplace = new RegExp(`{${option.toLowerCase()}}`, "ig");
    text = text.replace(toreplace, options[option]);
  }
  return text;
}

export async function addStats(
  client: ExtendedClient,
  guildID: string,
  commands: number,
  songs: number,
) {
  // Update for global stats
  const global = await client.database?.stats.upsert({
    where: {
      datasource: "global",
    },
    update: {
      commands: {
        increment: commands,
      },
      songs: {
        increment: songs,
      },
    },
    create: {
      datasource: "global",
      songs: songs,
      commands: commands,
    },
  });

  // Update for server stats
  const guild = await client.database?.stats.upsert({
    where: {
      datasource: guildID,
    },
    update: {
      commands: {
        increment: commands,
      },
      songs: {
        increment: songs,
      },
    },
    create: {
      datasource: guildID,
      songs: songs,
      commands: commands,
    },
  });

  client.caches?.set("global.stats", {
    commands: global?.commands as number,
    songs: global?.songs as number,
  });
  client.caches?.set(`${guildID}.stats`, {
    commands: guild?.commands as number,
    songs: guild?.songs as number,
  });
}

export function nFormatter(num: number, digits: number = 2) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
}

export async function swap_pages(
  client: ExtendedClient,
  message: Message,
  description: any,
  TITLE: any,
  guild_settings: guild_data,
) {
  const prefix = guild_settings?.prefix as string;
  const ls = guild_settings?.language as string;
  const cmduser = message.author;
  let currentPage = 0;
  //GET ALL EMBEDS
  const embeds: EmbedBuilder[] = [];
  //if input is an array
  if (Array.isArray(description)) {
    try {
      let k = 20;
      for (let i = 0; i < description.length; i += 20) {
        const current = description.slice(i, k);
        k += 20;
        const embed = new EmbedBuilder()
          .setDescription(current.join("\n"))
          .setTitle(TITLE)
          .setColor("#0000ff")
          .setThumbnail(client.user?.displayAvatarURL() as string);
        embeds.push(embed);
      }
      embeds;
    } catch (e) {
      client.sentry?.captureException(e);
      console.error(e);
    }
  } else {
    try {
      let k = 1000;
      for (let i = 0; i < description.length; i += 1000) {
        const current = description.slice(i, k);
        k += 1000;
        const embed = new EmbedBuilder()
          .setDescription(current)
          .setTitle(TITLE)
          .setColor("#0000ff")
          .setThumbnail(client.user?.displayAvatarURL() as string);
        embeds.push(embed);
      }
      embeds;
    } catch (e) {
      client.sentry?.captureException(e);
      console.error(e);
    }
  }
  if (embeds.length === 0)
    return message.channel
      .send({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              `${emoji?.msg.ERROR} No Content added to the SWAP PAGES Function`,
            )
            .setColor("#e01e01")
            .setThumbnail(client.user?.displayAvatarURL() as string),
        ],
      })
      .catch(() => null);
  if (embeds.length === 1)
    return message.channel.send({ embeds: [embeds[0]] }).catch(() => null);

  const button_back = new ButtonBuilder()
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("1")
    .setEmoji("1241000289893486743")
    .setLabel("Back");
  const button_home = new ButtonBuilder()
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("2")
    .setEmoji("1241000524900204675")
    .setLabel("Home");
  const button_forward = new ButtonBuilder()
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("3")
    .setEmoji("1241000663299657797")
    .setLabel("Forward");
  const button_blank = new ButtonBuilder()
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("button_blank")
    .setLabel("\u200b")
    .setDisabled();
  const button_stop = new ButtonBuilder()
    .setStyle(ButtonStyle.Secondary)
    .setCustomId("stop")
    .setEmoji("🛑")
    .setLabel("Stop");
  const allbuttons = [
    new ActionRowBuilder<ButtonBuilder>().addComponents([
      button_back,
      button_home,
      button_forward,
      button_blank,
      button_stop,
    ]),
  ];
  //Send message with buttons
  const swapmsg = await message.channel.send({
    content: `***Click on the __Buttons__ to swap the Pages***`,
    embeds: [embeds[0]],
    components: allbuttons,
  });
  //create a collector for the thinggy
  const collector = swapmsg.createMessageComponentCollector({
    filter: (i: any) =>
      i?.isButton() &&
      i?.user &&
      i?.user.id == cmduser.id &&
      i?.message.author?.id == client.user?.id,
    time: 180e3,
  }); //collector for 5 seconds
  //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
  collector.on("collect", async (b: any) => {
    if (b?.user.id !== message.author?.id)
      return b?.reply({
        content: `<:no:948483017993769041> **Only the one who typed ${prefix}help is allowed to react!**`,
        ephemeral: true,
      });
    //page forward
    if (b?.customId == "1") {
      collector.resetTimer();
      //b?.reply("***Swapping a PAGE FORWARD***, *please wait 2 Seconds for the next Input*", true)
      if (currentPage !== 0) {
        currentPage -= 1;
        await swapmsg
          .edit({
            embeds: [embeds[currentPage]],
            components: getDisabledComponents(swapmsg.components),
          })
          .catch(() => null);
        await b?.deferUpdate();
      } else {
        currentPage = embeds.length - 1;
        await swapmsg
          .edit({
            embeds: [embeds[currentPage]],
            components: getDisabledComponents(swapmsg.components),
          })
          .catch(() => null);
        await b?.deferUpdate();
      }
    }
    //go home
    else if (b?.customId == "2") {
      collector.resetTimer();
      //b?.reply("***Going Back home***, *please wait 2 Seconds for the next Input*", true)
      currentPage = 0;
      await swapmsg
        .edit({
          embeds: [embeds[currentPage]],
          components: getDisabledComponents(swapmsg.components),
        })
        .catch(() => null);
      await b?.deferUpdate();
    }
    //go forward
    else if (b?.customId == "3") {
      collector.resetTimer();
      //b?.reply("***Swapping a PAGE BACK***, *please wait 2 Seconds for the next Input*", true)
      if (currentPage < embeds.length - 1) {
        currentPage++;
        await swapmsg
          .edit({
            embeds: [embeds[currentPage]],
            components: getDisabledComponents(swapmsg.components),
          })
          .catch(() => null);
        await b?.deferUpdate();
      } else {
        currentPage = 0;
        await swapmsg
          .edit({
            embeds: [embeds[currentPage]],
            components: getDisabledComponents(swapmsg.components),
          })
          .catch(() => null);
        await b?.deferUpdate();
      }
    }
    //go forward
    else if (b?.customId == "stop") {
      await swapmsg
        .edit({
          embeds: [embeds[currentPage]],
          components: getDisabledComponents(swapmsg.components),
        })
        .catch(() => null);
      await b?.deferUpdate();
      collector.stop("stopped");
    }
  });
  collector.on("end", (reason: string) => {
    if (reason != "stopped") {
      swapmsg
        .edit({
          embeds: [embeds[currentPage]],
          components: getDisabledComponents(swapmsg.components),
        })
        .catch(() => null);
    }
  });
}

export async function GetUser(
  client: ExtendedClient,
  message: Message,
  arg: string[],
): Promise<User> {
  const errormessage = "<:no:948483017993769041> I failed finding that User...";
  return new Promise(async (resolve, reject) => {
    let args = arg;

    if (!client || !message) return reject("CLIENT IS NOT DEFINED");
    if (!args || args == null || args == undefined)
      args = message.content.trim().split(/ +/).slice(1);
    let user: GuildMember | User | undefined | null | string =
      message.mentions.users.first();
    if (!user && args[0] && args[0].length == 18) {
      user = await client.getUser?.(args[0]).catch(() => null);
      if (!user) return reject(errormessage);
      return resolve(user as User);
    } else if (!user && args[0]) {
      let alluser = message.guild?.members.cache.map((member) =>
        String(member.user.tag).toLowerCase(),
      );
      user = alluser?.find((user) =>
        user.startsWith(args.join(" ").toLowerCase()),
      );
      user = message.guild?.members.cache.find(
        (me) => String(me.user.tag).toLowerCase() == user,
      );
      if (!user || user == null || !user.id) {
        alluser = message.guild?.members.cache.map((member) =>
          String(
            member.displayName + "#" + member.user.discriminator,
          ).toLowerCase(),
        );
        user = alluser?.find((user) =>
          user.startsWith(args.join(" ").toLowerCase()),
        );
        user = message.guild?.members.cache.find(
          (me) =>
            String(
              me.displayName + "#" + me.user.discriminator,
            ).toLowerCase() == user,
        );
        if (!user || user == null || !user.id) return reject(errormessage);
      }

      user = await client.getUser?.(user.user.id).catch(() => null);
      return resolve(user as User);
    } else {
      user = message.mentions.users.first() || message.author;
      return resolve(user);
    }
  });
}

export async function GetGlobalUser(
  client: ExtendedClient,
  message: Message,
  args: string[],
): Promise<User> {
  const errormessage = "<:no:948483017993769041> I failed finding that User...";
  return new Promise(async (resolve, reject) => {
    if (!client || !message) return reject("CLIENT IS NOT DEFINED");
    if (!args || args == null || args == undefined)
      args = message.content.trim().split(/ +/).slice(1);
    let user: GuildMember | User | undefined | null | string =
      message.mentions.users.first();
    if (!user && args[0] && args[0].length == 18) {
      user = await client.getUser?.(args[0]).catch(() => null);
      if (!user) return reject(errormessage);
      return resolve(user);
    } else if (!user && args[0]) {
      const alluser = [],
        allmembers = [];
      const guilds = [...client.guilds.cache.values()];
      for await (const g of guilds) {
        const members = g.members.cache.map(
          (this_Code_is_by_trungisreal) => this_Code_is_by_trungisreal,
        );
        for await (const m of members) {
          alluser.push(m.user.tag);
          allmembers.push(m);
        }
      }
      user = alluser.find((user) =>
        user.startsWith(args.join(" ").toLowerCase()),
      );
      user = allmembers.find((me) => String(me.user.tag).toLowerCase() == user);
      if (!user || user == null || !user.id) {
        user = alluser.find((user) =>
          user.startsWith(args.join(" ").toLowerCase()),
        );
        user = allmembers.find(
          (me) =>
            String(
              me.displayName + "#" + me.user.discriminator,
            ).toLowerCase() == user,
        );
        if (!user || user == null || !user.id) return reject(errormessage);
      }
      user = await client.getUser?.(user.user.id).catch(() => null);
      if (!user) return reject(errormessage);
      return resolve(user);
    } else {
      user = message.mentions.users.first() || message.author;
      return resolve(user);
    }
  });
}

type MessageComponents = {
  components: ButtonBuilder[];
}[];

export function getDisabledComponents(
  MessageComponents: ActionRow<MessageActionRowComponent>[] | null | undefined
): ActionRow<MessageActionRowComponent>[] {
  if (!MessageComponents) return [];
  return MessageComponents.map((row) => {
    return {
      type: ComponentType.ActionRow,
      components: row.components.map((component) => {
        if (component.type === ComponentType.Button) {
          return {
            ...component,
            disabled: true
          };
        }
        return component;
      })
    } as ActionRow<MessageActionRowComponent>;
  });
}

export function ServerNavigationButton(
  guild: Guild | null,
): ActionRowBuilder<ButtonBuilder> | undefined {
  if (!guild) return;

  const button = new ButtonBuilder()
    .setLabel(`Sent from ${guild.name}`)
    .setStyle(ButtonStyle.Link)
    .setURL(`https://discord.com/channels/${guild.id}`);
  const components = new ActionRowBuilder<ButtonBuilder>().addComponents(
    button,
  );
  return components;
}

export function CheckDisabled(
  guild_settings: guild_data,
  category: string,
): boolean {
  if (category === "Fun" && !guild_settings?.commands[0].Fun) return false;
  if (category === "School Commands" && !guild_settings?.commands[0].School)
    return false;
  if (category === "MiniGames" && !guild_settings?.commands[0].Minigames)
    return false;
  if (category === "Programming" && !guild_settings?.commands[0].Programming)
    return false;
  return true;
}

export async function AddMessageCount(
  client: ExtendedClient,
  userID: string,
  guildID: string,
): Promise<void> {
  await client.database?.dailyMessage.upsert({
    where: {
      userID_serverID: {
        userID: userID,
        serverID: guildID,
      },
    },
    update: {
      messages: {
        increment: 1,
      },
    },
    create: {
      userID: userID,
      serverID: guildID,
      messages: 1,
    },
  });

  await client.database?.weeklyMessage.upsert({
    where: {
      userID_serverID: {
        userID: userID,
        serverID: guildID,
      },
    },
    update: {
      messages: {
        increment: 1,
      },
    },
    create: {
      userID: userID,
      serverID: guildID,
      messages: 1,
    },
  });
}

export function generateInvitesCache(
  invitesCache: Collection<string, Invite>,
): Collection<string, InviteJson> {
  const cacheCollection = new Collection<string, InviteJson>();
  invitesCache.forEach((invite) => {
    cacheCollection.set(invite.code, inviteToJson(invite));
  });
  return cacheCollection;
}

export function inviteToJson(invite: Invite): InviteJson {
  return {
    code: invite.code,
    uses: invite.uses,
    maxUses: invite.maxUses,
    inviter: invite.inviter,
    createdTimestamp: invite.createdTimestamp,
  };
}
