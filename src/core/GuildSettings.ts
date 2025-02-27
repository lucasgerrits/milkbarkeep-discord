import type { Features, GuildSettingsJson } from "../types/GuildTypes";

export class GuildSettings {
    public id: string;
    public commands: Array<string>;
    public features: Features;

    constructor(json: GuildSettingsJson) {
        this.id = json.id;
        this.commands = json.commands ?? [];
        this.features = json.features ?? {};
    }
}