import { EmbedBuilder, Guild, TextChannel } from "discord.js";
import { BlueskyApi } from "./BlueskyAPI";
import { ExtendedClient } from "../core/ExtendedClient";
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { Timestamps } from "../core/Timestamps";

export class BlueskyManager {
    private clientRef: ExtendedClient;

    constructor(clientRef: ExtendedClient) {
        this.clientRef = clientRef;
    }

    public async updateFeed(guildId: string) {
        if (!await this.clientRef.settings.isFeatureEnabled(guildId, "bskyFeed")) { return; }

        const guild: Guild = await this.clientRef.guilds.fetch(guildId);
        const guildName: string = guild.name;

        const channelId: string = await this.clientRef.settings.getChannelId(guildId, "bskyFeed");
        if (!channelId) {
            this.clientRef.logger.err(`${guildName} - Bluesky feed enabled, but no channel set`);
            return;
        }
        const channel: TextChannel = await this.clientRef.channels.fetch(channelId) as TextChannel;
        const channelName: string = channel.name;

        const feedUri: string = await this.clientRef.settings.getFeedUri(guildId) as string;
        if (!feedUri) {
            this.clientRef.logger.err(`${guildName} - Bluesky feed URI not located`);
            return;
        }

        const bskyApi: BlueskyApi = new BlueskyApi();
        const recentPosts: FeedViewPost[] = await bskyApi.getListFeed(feedUri);
        if (!recentPosts.length) {
            this.clientRef.logger.sky(`${guildName} ~ ${channelName} - No recent posts found`);
        } else {
            const plural: string = recentPosts.length === 1 ? "" : "s";
            this.clientRef.logger.sky(`${guildName} ~ ${channelName} - Updating feed with ${recentPosts.length} new post${plural}`);
        }

        for (const { post } of recentPosts) {
            const { author, record, indexedAt, uri, embed } = post;
            const postUrl: string = `https://bsky.app/profile/${author.did}/post/${uri.split("/").pop()}`;
            const timestamp: string = Timestamps.default(new Date(indexedAt));

            const messageEmbed = new EmbedBuilder()
                .setColor("#1183FE")
                .setAuthor({ 
                    name: author.displayName ?? author.handle,
                    iconURL: author.avatar || undefined,
                    url: `https://bsky.app/profile/${author.did}`
                })
                .setDescription((record as any)?.text)
                .setURL(postUrl)
                .setTimestamp(new Date(indexedAt))
                .setFooter({ text: timestamp });
            
            try {
                await channel.send({ embeds: [messageEmbed] });
            } catch (error: any) {
                this.clientRef.logger.err(`Failed to send Bluesky embed: ${error as string}`);
            }
        }
    }

    public async updateAllFeeds(): Promise<void> {
        const guilds: Array<string> = await this.clientRef.settings.getGuildIds();
        for (const guildId of guilds) {
            if (!await this.clientRef.settings.isFeatureEnabled(guildId, "bskyFeed")) { return; }
            await this.updateFeed(guildId);
        }
    }
}