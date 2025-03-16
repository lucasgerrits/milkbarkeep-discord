import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import { GuildSettings } from "./GuildSettings";
import { Logger } from "../util/Logger";
import type { FeatureName, GlobalVar, GuildSettingsJson } from "../types/GuildTypes";

export class GuildSettingsManager {
    private map: Map<string, GuildSettings>
    private dataDir: string = path.resolve(__dirname, './../../data');
    private guildsParentDir: string = path.resolve(this.dataDir, 'guilds');

    constructor() {
        this.map = new Map<string, GuildSettings>();
        this.importAllSettings();
        console.log(this.guildsParentDir);
    }

    public async getGuildIds(): Promise<Array<string>> {
        // Get list of all subdirectories in guilds, filter example, and retain only basenames
        let guildDirsArr: Array<string> = await glob(`${this.guildsParentDir}/*/`);
        guildDirsArr = guildDirsArr.filter(dir => !dir.endsWith("\\example"));
        const guildIds: Array<string> = guildDirsArr.map(dir => path.basename(dir));
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
        const settingsFile: string = path.resolve(guildDir, "settings.json");

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

    public async getChannelId(guildId: string, channelName: FeatureName): Promise<string> {
        return this.getSettings(guildId).then(settings => settings.features[channelName].channelId);
    }

    public async getCommands(guildId: string): Promise<Array<string>> {
        return this.getSettings(guildId).then(settings => settings.commands);
    }

    public async getUnloggedChannelIds(guildId: string): Promise<Array<string>> {
        return this.getSettings(guildId).then(settings => settings.channelsNotToLog);
    }

    public async getWelcomeMessage(guildId: string): Promise<string | undefined> {
        return this.getSettings(guildId).then(settings => settings.features["welcome"].output);
    }

    public async isFeatureEnabled(guildId: string, featureName: FeatureName): Promise<boolean> {
        return this.getSettings(guildId).then(settings => settings.features[featureName].enabled);
    }

    // #region Get Global Vars

    public async getGlobalVar(varName: string): Promise<GlobalVar> {
        const varsFile: string = path.resolve(this.dataDir, "vars.json");
        if (fs.existsSync(varsFile)) {
            const vars = JSON.parse(fs.readFileSync(varsFile, "utf8"));
            if (vars.hasOwnProperty(varName)) {
                return vars[varName];
            } else {
                throw new Error(`Global var not located: ${varName}`);
            }
        } else {
            const errorString: string = "vars.json not located";
            Logger.log(errorString);
            throw new Error(errorString);
        }
    }

    public async setGlobalVar(varName: string, newValue: GlobalVar): Promise<GlobalVar | undefined> {
        const varsFile: string = path.resolve(this.dataDir, "vars.json");
        if (fs.existsSync(varsFile)) {
            const vars = JSON.parse(fs.readFileSync(varsFile, 'utf8'));
            vars[varName] = newValue;
            const jsonString = JSON.stringify(vars, null, 4);
            fs.writeFileSync(varsFile, jsonString, "utf-8");
            return newValue;
        } else {
            const errorString: string = "vars.json not located";
            Logger.log(errorString);
        }
        return undefined;
    }

    public async incrementGlobalVar(varName: string): Promise<GlobalVar | undefined> {
        const oldValue: number = await this.getGlobalVar(varName) as number;
        return this.setGlobalVar(varName, oldValue + 1);
    }
}