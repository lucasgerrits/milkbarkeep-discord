import { Base64Resolvable, BufferResolvable, DiscordAPIError, Guild, GuildEmoji } from "discord.js";
import { ExtendedClient } from "./ExtendedClient";
import { Logger } from "../util/Logger";
import type { EmoteInfo, EmoteOperation } from "../types/GuildTypes";

export class EmoteManager {
    private clientRef: ExtendedClient;
    private readonly regex: RegExp = /<(a?):(\w+):(\d+)>/;
    private readonly errors = {
        limit: 30008,
        size: 50035,
        permission: 50013
    }

    constructor(clientRef: ExtendedClient) {
        this.clientRef = clientRef;
    }

    // #region Helpers

    public isEmote(str: string): boolean {
        str = str.replace(/\+/g, ""); // strip space
        return this.regex.test(str);
    }

    public emoteInfoFromString(content: string, rename?: string): EmoteInfo {
        const baseUrl: string = "https://cdn.discordapp.com/emojis/";
        const match: RegExpMatchArray = content.match(this.regex) as RegExpMatchArray;
        const isAnimated: boolean = match[1] === "a";
        const extension: string = isAnimated ? ".gif" : ".png";
        const info: EmoteInfo = {
            id: match[3],
            name: rename ?? match[2],
            cdnUrl: `${baseUrl}${match[3]}${extension}`,
            isAnimated: isAnimated
        }
        return info;
    }

    private getSlotsTotal(boostLevel: number): number {
        switch (boostLevel) {
            case 0: return 50;
            case 1: return 100;
            case 2: return 150;
            case 3: return 250;
            default: return 50;
        }
    }

    private getSlotsString(guildId: string) {
        const guild: Guild = this.clientRef.guilds.cache.get(guildId) as Guild;
        const slots: number = this.getSlotsTotal(guild.premiumTier);
        const staticUsed: number = guild.emojis.cache.filter(e => !e.animated).size;
        const animatedUsed: number = guild.emojis.cache.filter(e => e.animated).size;
        const staticRemaining: number = slots - staticUsed;
        const animatedRemaining: number = slots - animatedUsed;

        return `Static: ${staticUsed} / ${slots} (${staticRemaining} free)
            Animated: ${animatedUsed} / ${slots} (${animatedRemaining} free)
            Server Boost Level ${guild.premiumTier}`;
    }

    // #region Operations

    public async upload(guildId: string, emoteName: string, attachment: BufferResolvable | Base64Resolvable): Promise<EmoteOperation> {
        const guild: Guild = this.clientRef.guilds.cache.get(guildId) as Guild;
        const operation: EmoteOperation = {
            emoteName: emoteName,
            success: false,
            response: ""
        }
        try {
            const newEmote: GuildEmoji = await guild.emojis.create({
                attachment: attachment,
                name: emoteName
            });
            operation.emoteId = newEmote.id;
            operation.success = true;
            operation.response = `Emote successfully uploaded. \n\n${this.getSlotsString(guildId)}`
            Logger.log(`Successfully uploaded emote :${emoteName}: (${newEmote.id}) to guild ${guild.name} (${guildId})`);
        } catch (error: any) {
            Logger.log(`Failed to upload emote :${emoteName}: to guild ${guild.name} (${guildId}) : ${error as string}`);
            if (error instanceof DiscordAPIError) {
                if (error.code === this.errors.limit) {
                    operation.response = `This server is over emote capacity. \n\n ${this.getSlotsString(guildId)}`;
                } else if (error.code === this.errors.size) {
                    operation.response = "The image is too large or has invalid dimensions.";
                } else if (error.code === this.errors.permission) {
                    operation.response = "I lack the proper permission to add emotes.";
                } else {
                    operation.response = "The upload failed due to an unexpected error.";
                }
            } else {
                operation.response = "There was an unexpected problem uploading the emote.";
            }
        }
        return operation;
    }
}