import type { GuildConfigJson } from "../types/GuildTypes";

export class GuildConfig {
    public id: string;
    public commands: Array<string>;

    constructor(json: GuildConfigJson) {
        this.id = json.id;
        this.commands = json.commands;
    }
}