import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import { GuildSettings } from "./GuildSettings";
import { Logger } from "../util/Logger";
import type { ChannelName, FeatureName, GuildSettingsJson } from "../types/GuildTypes";

export class GuildSettingsManager {
    private map: Map<string, GuildSettings>
    private guildsParentDir: string = path.resolve(__dirname, './../../data/guilds');

    constructor() {
        this.map = new Map<string, GuildSettings>();
        this.importAllSettings();
    }

    public async getGuildIds(): Promise<Array<string>> {
        // Get list of all subdirectories in guilds, filter example, and retain only basenames
        let guildDirs: Array<string> = await glob(`${this.guildsParentDir}/*/`);
        guildDirs = guildDirs.filter(dir => !dir.endsWith("/example/"));
        const guildIds: Array<string> = guildDirs.map(dir => path.basename(dir));
        return guildIds;
    }

    // #region Internal Helpers

    private async importAllSettings(): Promise<void> {
        // Get list of all subdirectories in guilds
        const guildIds = await this.getGuildIds();

        // For each guild, import settings.json
        for (const guildId of guildIds) {
            this.importGuildSettings(guildId);
        };
    }

    private async importGuildSettings(guildId: string) {
        // Get path informationg given the guildId
        const guildDir: string = path.resolve(this.guildsParentDir, guildId);
        const settingsFile = path.resolve(guildDir, "settings.json");

        // If settings.json exists at path, update map
        if (fs.existsSync(settingsFile)) {
            const settingsJson: GuildSettingsJson = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
            const settings: GuildSettings = new GuildSettings(settingsJson);
            this.map.set(settings.id, settings);
        } else {
            Logger.log(`No settings file located for guild: ${path.basename(guildDir)}`);
        }
    }

    private async getSettings(guildId: string): Promise<GuildSettings> {
        await this.importGuildSettings(guildId);
        const settings: GuildSettings | undefined = this.map.get(guildId);
        if (!settings)  {
            throw new Error(`Provided guild id not found: ${guildId}`);
        }
        return settings;
    }

    // #region Get Specific Settings

    public async getChannelId(guildId: string, channelName: ChannelName): Promise<string> {
        const guildSettings: GuildSettings = await this.getSettings(guildId);
        return guildSettings.channels[channelName];
    }

    public async getCommands(guildId: string): Promise<Array<string>> {
        const settings: GuildSettings = await this.getSettings(guildId);
        return settings.commands;
    }

    public async getWelcomeMessage(guildId: string): Promise<string> {
        const guildSettings: GuildSettings = await this.getSettings(guildId);
        return guildSettings.welcomeMessage;
    }

    public async isFeatureEnabled(guildId: string, featureName: FeatureName): Promise<boolean> {
        const guildSettings: GuildSettings = await this.getSettings(guildId);
        return guildSettings.features[featureName];
    }
}