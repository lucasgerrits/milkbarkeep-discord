import { Base64Resolvable, BufferResolvable, DiscordAPIError, Guild, GuildEmoji } from "discord.js";
import { ExtendedClient } from "./ExtendedClient";
import { Logger } from "../util/Logger";
import type { EmoteOperation } from "../types/GuildTypes";

export class EmoteManager {
    private clientRef: ExtendedClient;
    private readonly errors = {
        limit: 30008,
        size: 50035,
        permission: 50013
    }

    constructor(clientRef: ExtendedClient) {
        this.clientRef = clientRef;
    }

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
            operation.response = "Emote successfully uploaded to server."
            Logger.log(`Successfully uploaded emote :${emoteName}: (${newEmote.id}) to guild ${guild.name} (${guildId})`);
        } catch (error: any) {
            Logger.log(`Failed to upload emote :${emoteName}: to guild ${guild.name} (${guildId}) : ${error as string}`);
            if (error instanceof DiscordAPIError) {
                if (error.code === this.errors.limit) {
                    operation.response = "The server has reached it's emoji limit.";
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