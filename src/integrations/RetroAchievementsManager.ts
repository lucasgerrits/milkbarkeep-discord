import * as fs from "fs";
import * as path from "path";
import { AchievementUnlocksMetadata, AuthObject, buildAuthorization, GameExtended } from "@retroachievements/api";
import { ExtendedClient } from "../core/ExtendedClient";
import { retroAchievements as api } from "../../data/apiKeys.json";
import { RetroAchievementsApi } from "./RetroAchievementsApi";
import { RetroAchievementsEmbeds } from "./RetroAchievementsEmbeds";
import { achievementData, RARankingType, RASettingsJson, RASettingsSchema, userPoints } from "../types/RATypes";
import { EmbedBuilder, Guild, TextChannel } from "discord.js";
import { Util } from "../util/Util";
import type { ExtendedInteraction } from "../types/CommandTypes";

export class RetroAchievementsManager {

    public readonly defaultMinToLookBack: number = 15;

    private username: string = api.username;
    private webApiKey: string = api.key;
    private auth: AuthObject;
    private clientRef: ExtendedClient;

    /**
     * Docs: https://api-docs.retroachievements.org/getting-started.html#quick-start-client-library
     */
    constructor(clientRef: ExtendedClient) {
        this.clientRef = clientRef;
        this.auth = buildAuthorization({
            "username": this.username,
            "webApiKey": this.webApiKey,
        });
    }

    // #region Json

    private async getGuildRASettings(guildId: string): Promise<RASettingsJson> {
        const guildDir: string = path.resolve(__dirname, './../../data/guilds', guildId);
        const settingsFile: string = path.resolve(guildDir, "raUsers.json");

        if (fs.existsSync(settingsFile)) {
            const rawJson = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
            try {
                const validatedJson: RASettingsJson = RASettingsSchema.parse(rawJson);
                return validatedJson;
            } catch (error: any) {
                this.clientRef.logger.err(`Invalid RA JSON settings for guild ${path.basename(guildDir)}: ${error}`);
                throw error;
            }
        } else {
            const errorStr: string = `No RA settings file located for guild ${path.basename(guildDir)}`;
            this.clientRef.logger.err(errorStr);
            throw new Error(errorStr);
        }
    }

    private async getGuildRAUsers(guildId: string): Promise<Array<string>> {
        return (await this.getGuildRASettings(guildId)).users;
    }

    // #region Achievement Feeds

    public async getRecentList(userList: Array<string>, minutesToLookBack: number = this.defaultMinToLookBack): Promise<Array<achievementData>> {
        let recentList: Array<achievementData> = new Array<achievementData>;
        try {
            recentList = await RetroAchievementsApi.getRecentList(this.auth, userList, minutesToLookBack);
        } catch (error: any) {
            throw error;
        }
        return recentList;
    }

    public async updateFeed(guildId: string, minutesToLookBack: number = this.defaultMinToLookBack) {
        const userList: Array<string> = await this.getGuildRAUsers(guildId);
        const channelId: string = await this.clientRef.settings.getChannelId(guildId, "raFeed");
        const channel: TextChannel = await this.clientRef.channels.fetch(channelId) as TextChannel;
        const channelName: string = channel.name;
        const guild: Guild = await this.clientRef.guilds.fetch(guildId);
        const guildName = guild.name;

        // Get array of recent achievements
        let recent: achievementData[];
        try {
            recent = await this.getRecentList(userList, minutesToLookBack);
            if (recent.length === 0) {
                this.clientRef.logger.ra(`${guildName} ~ ${channelName} - No new achievements found`);
                return;
            } else {
                const plural: string = recent.length === 1 ? "" : "s";
                this.clientRef.logger.ra(`${guildName} ~ ${channelName} - Updating feed with ${recent.length} new achievement${plural}`);
            }
        } catch (error: any) {
            this.clientRef.logger.err(error as string);
            const channel: TextChannel = this.clientRef.channels.cache.get(channelId) as TextChannel;
            await channel.send({ content: error as string });
            return;
        }

        // For each result, create a new embed
        const embeds: EmbedBuilder[] = [];
        for (const row of recent) {
            const embed: EmbedBuilder = await RetroAchievementsEmbeds.createFeedAchievementEmbed(row);
            embeds.push(embed);
        }
        const chunkedEmbeds: Array<EmbedBuilder[]> = Util.chunkArray(embeds, 10);

        // Send all embeds in one message to chat
        try {
            const channel: TextChannel = this.clientRef.channels.cache.get(channelId) as TextChannel;
            for (const chunk of chunkedEmbeds) {
                await channel.send({
                    embeds: chunk,
                });
            }
        } catch (error: any) {
            this.clientRef.logger.err(error as string);
        }
    }

    public async updateAllFeeds(minutesToLookBack: number = this.defaultMinToLookBack) {
        const guilds: Array<string> = await this.clientRef.settings.getGuildIds();

        for (const guildId of guilds) {
            // Check if RA feed enabled for each guild
            if (!await this.clientRef.settings.isFeatureEnabled(guildId, "raFeed")) { return; }
            await this.updateFeed(guildId, minutesToLookBack);
        }
    }

    // #region Single Achievement

    public async sendIdAchievement(achId: number, interaction: ExtendedInteraction): Promise<void> {
        const achData: AchievementUnlocksMetadata = await RetroAchievementsApi.getAchievementUnlocks(this.auth, achId);
        await Util.sleep(RetroAchievementsApi.callDelayInMS);
        const gameData: GameExtended = await RetroAchievementsApi.getGameExtended(this.auth, achData.game.id);
        const embed: EmbedBuilder = RetroAchievementsEmbeds.createIdAchievementEmbed(achId, achData, gameData);
        try {
            await interaction.editReply({
                content: "",
                embeds: [ embed ],
            });
        } catch (error: any) {
            throw error;
        }
    }

    // #region Rankings

    // TODO: Make content string guild agnostic
    public async sendRankingsList(guildId: string, listType: RARankingType, destination: string | ExtendedInteraction): Promise<void> {
        const userList: Array<string> = await this.getGuildRAUsers(guildId);

        let userPointsList: Array<userPoints>;
        if (listType === "daily") {
            userPointsList = await RetroAchievementsApi.getDailyList(this.auth, userList, true);
        } else if (listType === "weekly") {
            userPointsList = await RetroAchievementsApi.getWeeklyList(this.auth, userList, true);
        } else {
            userPointsList = await RetroAchievementsApi.getAllTimeList(this.auth, userList);
        } 
        const embed: EmbedBuilder = RetroAchievementsEmbeds.createRankingEmbed(userPointsList, listType);

        const guild: Guild = this.clientRef.guilds.cache.get(guildId) as Guild;
        const guildName: string = guild.name;
        const contentStr: string = `${guildName} RA Users Ranking`;
        const message = {
            content: contentStr,
            embeds: [ embed ],
        };

        if (typeof destination === "string") {
            // Channel ID
            const channel: TextChannel = this.clientRef.channels.cache.get(destination) as TextChannel;
            await channel.send(message);
        } else {
            // Slash command reply
            await destination.editReply(message);
        }
    }

    // #region Weekly Report

    public async weeklyReport(): Promise<void> {
        const guilds: Array<string> = await this.clientRef.settings.getGuildIds();

        for (const guildId of guilds) {
            // Check if RA weekly recap enabled for each guild
            if (!await this.clientRef.settings.isFeatureEnabled(guildId, "raWeekly")) {
                return;
            }
            const channelId: string = await this.clientRef.settings.getChannelId(guildId, "raWeekly");
            await this.sendRankingsList(guildId, "weekly", channelId);
        }
    }
}