import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import { GuildSettings } from "./GuildSettings";
import { Logger } from "../util/Logger";
import type { ChannelName, FeatureName, GuildSettingsJson } from "../types/GuildTypes";

export class GuildSettingsManager {
    private map: Map<string, GuildSettings>

    constructor() {
        this.map = new Map<string, GuildSettings>();
        this.importSettings();
    }

    private async importSettings(): Promise<void> {
        const guildsParentDir: string = path.resolve(__dirname, './../../data/guilds');
        const guildDirs: Array<string> = await glob(`${guildsParentDir}/*/`);

        for (const guildDir of guildDirs) {
            const dirName = path.basename(guildDir);
            if (dirName === "example") {
                continue;
            }

            const settingsFile = path.resolve(guildDir, "settings.json");
            
            if (fs.existsSync(settingsFile)) {
                const settingsJson: GuildSettingsJson = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
                const settings: GuildSettings = new GuildSettings(settingsJson);
                this.map.set(settings.id, settings);
            } else {
                Logger.log(`No settings file located for guild: ${path.basename(guildDir)}`);
            }
        };
    }

    public async getChannelId(guildId: string, channelName: ChannelName): Promise<string> {
        const guildSettings: GuildSettings = await this.getSettings(guildId);
        return guildSettings.channels[channelName];
    }

    public async getCommands(guildId: string): Promise<Array<string>> {
        const settings: GuildSettings = await this.getSettings(guildId);
        return settings.commands;
    }

    private async getSettings(guildId: string): Promise<GuildSettings> {
        const settings: GuildSettings | undefined = this.map.get(guildId);

        if (!settings)  {
            throw new Error(`Provided guild id not found: ${guildId}`);
        }

        return settings;
    }

    public async getGuildIds(): Promise<Array<string>> {
        return Array.from(this.map.keys());
    }

    public async isFeatureEnabled(guildId: string, featureName: FeatureName): Promise<boolean> {
        const guildSettings: GuildSettings = await this.getSettings(guildId);
        return guildSettings.features[featureName];
    }
}