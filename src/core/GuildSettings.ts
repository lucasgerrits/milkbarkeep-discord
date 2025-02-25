import type { ChannelName, FeatureName, GuildSettingsJson } from "../types/GuildTypes";

export class GuildSettings {
    public id: string;
    public commands: Array<string>;
    public welcomeMessage: string;
    public channels: {
        [key in ChannelName]: string;
    }
    public features: {
        [key in FeatureName]: boolean;
    }

    constructor(json: GuildSettingsJson) {
        this.id = json.id;
        this.commands = json.commands ?? [];
        this.channels = json.channels ?? {};
        this.features = json.features ?? {};
        this.welcomeMessage = json.welcomeMessage || "";
    }
}