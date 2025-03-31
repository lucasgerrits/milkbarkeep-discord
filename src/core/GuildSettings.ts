import type { Features, GuildSettingsJson } from "../types/AppTypes";

export class GuildSettings {
    public id: string;
    public channelsNotToLog: Array<string>;
    public commands: Array<string>;
    public features: Features;

    constructor(json: GuildSettingsJson) {
        this.id = json.id;
        this.channelsNotToLog = json.channelsNotToLog ?? [];
        this.commands = json.commands ?? [];
        this.features = json.features ?? {};
    }
}