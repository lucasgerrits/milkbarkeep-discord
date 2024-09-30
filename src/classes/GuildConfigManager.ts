import { glob } from "glob";
import { GuildConfig } from "./GuildConfig";
import type { GuildConfigJson } from "../types/GuildTypes";

export class GuildConfigManager {
    private map: Map<string, GuildConfig>

    constructor() {
        this.map = new Map<string, GuildConfig>();
    }

    async importFile(filePath: string): Promise<any> {
        return (await import(filePath))?.default;
    }

    private async setConfigs(): Promise<void> {
        const configFiles = await glob(`${__dirname}/../../data/guilds/*{.json}`);
        for (const file of configFiles) {
            const command: GuildConfigJson = await this.importFile(`${__dirname}/../${file}`);
        };
    }
}