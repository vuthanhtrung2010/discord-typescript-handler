import {
  ActionRow,
  ActionRowBuilder,
  CacheType,
  Client,
  Collection,
  Message,
  MessageActionRowComponent,
  MessageActionRowComponentBuilder,
  MessageComponentInteraction,
  User,
} from "discord.js";
import { PrismaClient } from "@prisma/client";
import { checkGuild } from "./handlers/functions";
import { ClusterClient } from "discord-hybrid-sharding";
import { Shard } from "discord-cross-hosting";
import { Ollama } from "ollama";
import { LavalinkManager } from "lavalink-client";
import { NodeClient } from "@sentry/node";

// Define type for guild_settings
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export type guild_data = ThenArg<ReturnType<typeof checkGuild>>;

export interface ExtendedClient extends Client {
  commands?: Collection<string, MessageCommand>;
  aliases?: Map<string, string>;
  la?: { [key: string]: any };
  database?: PrismaClient;
  caches?: Map<string, any>;
  cooldowns?: Map<string, Collection<string, number>>;
  cluster?: ClusterClient<Client>;
  slashCommands?: Map<string, any>;
  categories?: string[];
  broadCastCache?: Map<string, any>;
  machine?: Shard;
  ollama?: Ollama;
  lavalink?: LavalinkManager;
  sentry?: NodeClient;
  data?: {
    stats: {
      linesOfCode: number;
      lettersOfCode: number;
      files: number;
      MapAndSet: number;
    };
  };
  fetched?: boolean;
  invitations?: { [key: string]: Collection<string, InviteJson> };
  disableComponentMessage?: (
    C: MessageComponentInteraction<CacheType>,
  ) => boolean | void;
  getDisabledComponents?: (
    MessageComponents: ActionRow<MessageActionRowComponent>[],
  ) => ActionRowBuilder<MessageActionRowComponentBuilder>[];
  getUser?: (id: string) => Promise<User>;
}

export interface MessageCommand {
  name: string;
  category: string;
  aliases?: Array<string>;
  usage: string;
  description: string;
  cooldown: number;
  type?: string;
  memberpermissions?: Array<bigint>;
  run: (
    client: ExtendedClient,
    message: Message,
    args: Array<string>,
    guild_settings: guild_data,
  ) => Promise<void> | void | Message | Promise<Message>;
} // MessageCommands Interface

export interface ClientEvent {
  name: string;
  run: (...args: any[]) => Promise<void> | void;
} // Events Interface

// Embeds
export interface Embed {
  title?: string;
  description?: string;
  url: string;
  color: string | number;
  fields: Fields[];
  thumbnail?: { url: string };
  image?: { url: string };
  timestamp?: Date;
  footer?: {
    text: string;
    icon_url: string;
  };
}

export interface Fields {
  name: string;
  value: string;
  inline?: boolean;
}

export interface InviteJson {
  code: string;
  uses: number | null;
  maxUses: number | null;
  inviter: User | null;
  createdTimestamp: number | null;
}

export interface Payload {
  content?: string;
  embeds: Embed[];
}

export type AnyCommand = MessageCommand;
