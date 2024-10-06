import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import { GuildConfig } from "./GuildConfig";
import type { GuildConfigJson } from "../types/GuildTypes";

export class GuildConfigManager {
    private map: Map<string, GuildConfig>

    constructor() {
        this.map = new Map<string, GuildConfig>();
        this.importConfigs();
    }

    private async importConfigs(): Promise<void> {
        const jsonDir = path.resolve(__dirname, './../../data/guilds');
        const configFiles: Array<string> = await glob(`${jsonDir}/*.json`);
        for (const file of configFiles) {
            const configJson: GuildConfigJson = JSON.parse(fs.readFileSync(file, 'utf8'));
            const config: GuildConfig = new GuildConfig(configJson);
            this.map.set(config.id, config);
        };
    }

    public async getConfig(id: string): Promise<GuildConfig | undefined> {
        return this.map.get(id);
    }

    public async getIdArray(): Promise<Array<string>> {
        return Array.from(this.map.keys());
    }

    public async getConfigArray(): Promise<Array<GuildConfig>> {
        return Array.from(this.map.values());
    }
}