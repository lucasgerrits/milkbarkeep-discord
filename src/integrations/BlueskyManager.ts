import { EmbedBuilder, Guild, TextChannel } from "discord.js";
import { BlueskyApi } from "./BlueskyAPI";
import { ExtendedClient } from "../core/ExtendedClient";
import { FeedViewPost, PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { Timestamps } from "../core/Timestamps";
import { ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { AppBskyFeedPost } from "@atproto/api";
import { ParentPostInfo } from "../types/BlueskyTypes";
import { Util } from "../util/Util";

export class BlueskyManager {
    private clientRef: ExtendedClient;
    private agent: BlueskyApi;

    constructor(clientRef: ExtendedClient) {
        this.clientRef = clientRef;
        this.agent = new BlueskyApi();
    }

    private postUrl(authorDid: string, postUri: string): string {
        return `https://bsky.app/profile/${authorDid}/post/${postUri.split("/").pop()}`;
    }

    public async buildDiscordEmbedFromPost(post: PostView): Promise<EmbedBuilder | null> {
        const author: ProfileViewBasic = post.author;
        const authorName: string = author.displayName ? `${author.displayName} (${author.handle})` : author.handle;
        const postUrl: string = this.postUrl(author.did, post.uri);
        const indexedAt: string = post.indexedAt;
        const timestampDefault: string = Timestamps.default(new Date(indexedAt));
        const timestampRelative: string = Timestamps.relative(new Date(indexedAt));
        let description: string = "";

        const record: AppBskyFeedPost.Record | null = this.agent.getValidatedRecord(post.record);
        if (!record) { return null; }
        description += record?.text;
        const reply: AppBskyFeedPost.ReplyRef | null = this.agent.getValidatedReplyRef(record.reply);
        if (reply) {
            const parentPost: ParentPostInfo | null = await this.agent.getParentPostInfo(reply.parent.uri);
            if (parentPost) {
                const parentPostUrl: string = this.postUrl(parentPost.author.did, parentPost.uri);
                const parentPostAuthorLink: string = `[${parentPost.author.displayName} (${parentPost.author.handle})](<${parentPostUrl}>)`;
                description += `\n\n> -# ↩ Replying to ${parentPostAuthorLink}:${Util.addBrailleBlank()}\n> -# ${parentPost?.text}`;
            }
        }

        const messageEmbed = new EmbedBuilder()
            .setColor("#1183FE")
            .setAuthor({
                name: authorName,
                iconURL: author.avatar || undefined,
                url: postUrl
            })
            .setDescription(description)
            .setURL(postUrl)
            .addFields(
                { name: "", value: `${timestampDefault}\n${timestampRelative}`, inline: true },
            );
        return messageEmbed;
    }

    public async updateAllFeeds(): Promise<void> {
        const guilds: Array<string> = await this.clientRef.settings.getGuildIds();
        for (const guildId of guilds) {
            if (!await this.clientRef.settings.isFeatureEnabled(guildId, "bskyFeed")) { return; }
            await this.updateFeed(guildId);
        }
    }

    public async updateFeed(guildId: string): Promise<void> {
        if (!await this.clientRef.settings.isFeatureEnabled(guildId, "bskyFeed")) { return; }

        const guild: Guild = await this.clientRef.guilds.fetch(guildId);
        const guildName: string = guild.name;

        // Get guild specific feed settings
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

        // Get feed posts
        const recentPosts: FeedViewPost[] = await this.agent.getListFeed(feedUri);
        if (!recentPosts.length) {
            this.clientRef.logger.sky(`${guildName} ~ ${channelName} - No recent posts found`);
        } else {
            const plural: string = recentPosts.length === 1 ? "" : "s";
            this.clientRef.logger.sky(`${guildName} ~ ${channelName} - Updating feed with ${recentPosts.length} new post${plural}`);
        }

        // For each post, create an embed
        for (const postWrapper of recentPosts) {
            const post: PostView = postWrapper.post;
            const embed: EmbedBuilder | null = await this.buildDiscordEmbedFromPost(post);
            if (!embed) { continue; }
            try {
                await channel.send({ embeds: [embed] });
            } catch (error: any) {
                this.clientRef.logger.err(`Failed to send Bluesky embed: ${error as string}`);
            }
        }
    }
}