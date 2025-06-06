import { EmbedBuilder, Guild, TextChannel } from "discord.js";
import { BlueskyApi } from "./BlueskyAPI";
import { ExtendedClient } from "../core/ExtendedClient";
import { FeedViewPost, PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { Timestamps } from "../core/Timestamps";
import { ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyFeedPost } from "@atproto/api";
import { ParentPostInfo } from "../types/BlueskyTypes";
import { Util } from "../util/Util";
import { XRPCError } from '@atproto/xrpc';

export class BlueskyManager {
    private clientRef: ExtendedClient;
    private agent: BlueskyApi;
    public readonly defaultMinutesToLookBack: number = 10;

    constructor(clientRef: ExtendedClient) {
        this.clientRef = clientRef;
        this.agent = new BlueskyApi();
    }

    private postUrl(authorDid: string, postUri: string): string {
        return `https://bsky.app/profile/${authorDid}/post/${postUri.split("/").pop()}`;
    }

    private quoteify(text: string): string {
        return text.replace(/\n\n|\n(?!\n)/g, match =>
            match === '\n\n' ? '\n> \n> -# ' : '\n> -# '
        );
    }

    private async getReplyContext(record: AppBskyFeedPost.Record): Promise<string> {
        const reply: AppBskyFeedPost.ReplyRef | null = this.agent.getValidatedReplyRef(record.reply);
        if (reply) {
            this.clientRef.logger.deb("validated reply", reply);
            const parentPost: ParentPostInfo | null = await this.agent.getParentPostInfo(reply.parent.uri);
            if (parentPost) {
                const parentPostUrl: string = this.postUrl(parentPost.author.did, parentPost.uri);
                const parentPostAuthorLink: string = `[${parentPost.author.displayName} (${parentPost.author.handle})](<${parentPostUrl}>)`;
                const replyAuthorText: string = `\n> -# ↩ Replying to ${parentPostAuthorLink}:`;
                const replyPostText: string = (parentPost?.text) ? this.quoteify(`\n${parentPost?.text}`) : "";
                return `\n${replyAuthorText}${replyPostText}`;
            }
        }
        return "";
    }

    private async processBlueskyEmbed(post: PostView) {
        // No embed
        if (!post.embed) { return; }
        // No images, quoted post
        if (post.embed.$type === "app.bsky.embed.record#view") {

        // Images, quoted post
        } else if (post.embed.$type === "app.bsky.embed.recordWithMedia#view") {

        }
    }

    private async getQuoteContext(post: PostView): Promise<string> {
        let embeddedRecord: unknown = null;
        if (!post.embed) { return ""; }
        if (post.embed?.$type === "app.bsky.embed.record#view") {
            const embed = post.embed as AppBskyEmbedRecord.View;
            embeddedRecord = embed.record;
        } else if (post.embed?.$type === "app.bsky.embed.recordWithMedia#view") {
            const embed = post.embed as AppBskyEmbedRecordWithMedia.View;
            embeddedRecord = embed.record?.record;
        }
        this.clientRef.logger.deb("embeddedRecord after typing", embeddedRecord);
        const quotePost: AppBskyEmbedRecord.ViewRecord | null = this.agent.getValidatedViewRecord(embeddedRecord);
        if (!quotePost) return "";
        this.clientRef.logger.deb("validated quote post", quotePost);
        const quotePostAuthor: ProfileViewBasic = quotePost.author;
        const quotePostUrl: string = this.postUrl(quotePost.author.did, quotePost.uri);
        const quotePostAuthorLink: string = `[${quotePostAuthor.displayName} (${quotePostAuthor.handle})](<${quotePostUrl}>)`;
        const quotePostAuthorText: string = `\n> -# 🔁︎ Quoting ${quotePostAuthorLink}:`;
        const quotePostText: string = ((quotePost.value as any)?.text) ? this.quoteify((quotePost.value as any).text) : "";
        return `\n${quotePostAuthorText}${quotePostText}`;
    }

    public async buildDiscordEmbedFromPost(post: PostView): Promise<EmbedBuilder | null> {
        this.clientRef.logger.deb("post data passed to embed builder", post);
        const record: AppBskyFeedPost.Record | null = this.agent.getValidatedRecord(post.record);
        if (!record) { return null; }

        const author: ProfileViewBasic = post.author;
        const authorName: string = author.displayName ? `${author.displayName} (${author.handle})` : author.handle;
        const postUrl: string = this.postUrl(author.did, post.uri);
        const indexedAt: string = post.indexedAt;
        const timestampDefault: string = Timestamps.default(new Date(indexedAt));
        const timestampRelative: string = Timestamps.relative(new Date(indexedAt));
        const description: string | null = (record?.text && record.text.trim().length > 0) ? record.text : null;

        const messageEmbed = new EmbedBuilder()
            .setColor("#1183FE")
            .setAuthor({
                name: authorName + Util.addBrailleBlank(),
                iconURL: author.avatar || undefined,
                url: postUrl
            })
            .setDescription(description)
            .setURL(postUrl);
        
        //const quoteStr: string = await this.getQuoteContext(record);
        //if (quoteStr) { messageEmbed.addFields({ name: "", value: quoteStr }); }
        await this.processBlueskyEmbed(post);


        const replyStr: string = await this.getReplyContext(record);
        if (replyStr) { messageEmbed.addFields({ name: "", value: replyStr }); }
        

        messageEmbed.addFields({ name: "", value: `${timestampDefault}\n${timestampRelative}`, inline: true });
        return messageEmbed;
    }

    public async updateAllFeeds(minutesToLookBack: number = this.defaultMinutesToLookBack): Promise<void> {
        const guilds: Array<string> = await this.clientRef.settings.getGuildIds();
        for (const guildId of guilds) {
            if (!await this.clientRef.settings.isFeatureEnabled(guildId, "bskyFeed")) { return; }
            await this.updateFeed(guildId, minutesToLookBack);
        }
    }

    public async updateFeed(guildId: string, minutesToLookBack: number = this.defaultMinutesToLookBack): Promise<void> {
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
        try{
            const recentPosts: FeedViewPost[] = await this.agent.getListFeed(feedUri, minutesToLookBack);

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
                } catch (error: unknown) {
                    this.clientRef.logger.err(`${guildName} ~ ${channelName} - Failed to send Bluesky embed: ${error as string}`);
                }
            }
        } catch (error: unknown) {
            if (error instanceof XRPCError) {
                this.clientRef.logger.err(`${guildName} ~ ${channelName} - Failed to fetch Bluesky list feed: ${error.error}`);
            } else {
                this.clientRef.logger.err(`${guildName} ~ ${channelName} - Failed to fetch Bluesky list feed: ${error as string}`);
            }
        }
    }
}