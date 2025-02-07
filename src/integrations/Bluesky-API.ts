import { AtpAgent } from "@atproto/api";
import { bluesky as account } from "../../data/apiKeys.json";

export class BlueskyApi {
    private agent: AtpAgent;

    constructor() {
        this.agent = new AtpAgent({
            service: "http://bsky.social"
        });
        this.login();
    }

    private async login(): Promise<void> {
        await this.agent.login({
            identifier: account.identifier,
            password: account.password
        });
    }

    public async post(inputText: string): Promise<void> {
        const postResult = await this.agent.post({
            text: inputText,
            createdAt: new Date().toISOString()
        });
    }
}