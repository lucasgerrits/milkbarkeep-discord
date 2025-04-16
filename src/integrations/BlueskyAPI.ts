import { AtpAgent } from "@atproto/api";
import { bluesky as account } from "../../data/apiKeys.json";
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

export class BlueskyApi {
    private agent: AtpAgent;

    constructor() {
        this.agent = new AtpAgent({
            service: "https://bsky.social"
        });
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
        await this.login();
        const postResult = await this.agent.post({
            text: inputText,
            createdAt: new Date().toISOString()
        });
        this.logout();
        return postResult;
    }

    public async getListFeed(listUri: string, minutesToLoookBack: number = 15): Promise<FeedViewPost[]> {
        await this.login();
        const now: Date = new Date();
        const xMinutesAgo: Date = new Date(now.getTime() - (minutesToLoookBack * 60 * 1000));

        const result = await this.agent.app.bsky.feed.getListFeed({
            list: listUri,
            limit: 100,
        });

        const recentPosts: FeedViewPost[] = result.data.feed.filter(item => {
            const indexedAt = new Date(item.post.indexedAt);
            return indexedAt >= xMinutesAgo;
        });

        this.logout();
        return recentPosts;
    }
}