import { AppBskyFeedPost, AtpAgent } from "@atproto/api";
import { bluesky as account } from "../../data/apiKeys.json";
import { FeedViewPost, isThreadViewPost, PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { ValidationResult } from "@atproto/lexicon/src/types";
import { AuthorInfo, ParentPostInfo } from "../types/BlueskyTypes";

export class BlueskyApi {
    private agent: AtpAgent;

    constructor() {
        this.agent = new AtpAgent({
            service: "https://bsky.social"
        });
        this.login();
    }

    private async login(): Promise<void> {
        await this.agent.login({
            identifier: account.identifier,
            password: account.password
        });
    }
    
    private async logout(): Promise<void> {
        await this.agent.logout();
    }

    public async post(inputText: string): Promise<{uri: string, cid: string}> {
        const postResult = await this.agent.post({
            text: inputText,
            createdAt: new Date().toISOString()
        });
        return postResult;
    }

    public async getListFeed(listUri: string, minutesToLoookBack: number = 15): Promise<FeedViewPost[]> {
        const now: Date = new Date();
        const xMinutesAgo: Date = new Date(now.getTime() - (minutesToLoookBack * 60 * 1000));
        const result = await this.agent.app.bsky.feed.getListFeed({
            list: listUri,
            limit: 100,
        });
        const recentPosts: FeedViewPost[] = result.data.feed.filter(item => {
            const indexedAt = new Date(item.post.indexedAt);
            return indexedAt >= xMinutesAgo;
        }).reverse();
        return recentPosts;
    }

    public async getParentPostInfo(uri: string): Promise<ParentPostInfo | null> {
        const result = await this.agent.getPostThread({ uri });
        const thread = result.data.thread;
        if (!isThreadViewPost(thread)) { return null; }
        const parentPost: PostView = thread.post;
        const record: AppBskyFeedPost.Record | null = this.getValidatedRecord(parentPost.record);
        if (!record) { return null; }
        const text: string = record.text ?? "";
        const author: AuthorInfo = {
            did: parentPost.author.did,
            handle: parentPost.author.handle,
            displayName: parentPost.author.displayName,
            avatar: parentPost.author.avatar,
        };
        return {
            author,
            text,
            uri: parentPost.uri
        }
    }

    public getValidatedRecord(record: unknown): AppBskyFeedPost.Record | null {
        const validation: ValidationResult = AppBskyFeedPost.validateRecord(record);
        if (!validation.success) { return null; }
        return record as AppBskyFeedPost.Record;
    }
    
    public getValidatedReplyRef(replyRef: unknown): AppBskyFeedPost.ReplyRef | null {
        const validation: ValidationResult = AppBskyFeedPost.validateReplyRef(replyRef);
        if (!validation.success) { return null; }
        return replyRef as AppBskyFeedPost.ReplyRef;
    }
}