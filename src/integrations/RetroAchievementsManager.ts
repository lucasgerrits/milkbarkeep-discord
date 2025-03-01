import { AchievementUnlocksMetadata, AuthObject, buildAuthorization, GameExtended } from "@retroachievements/api";
import { ExtendedClient } from "../core/ExtendedClient";
import { Logger } from "../util/Logger";
import { retroAchievements as api } from "../../data/apiKeys.json";
import { RetroAchievementsApi } from "./RetroAchievementsApi";
import { RetroAchievementsEmbeds } from "./RetroAchievementsEmbeds";
import { achievementData, RARankingType, userPoints } from "../types/RATypes";
import { EmbedBuilder, TextChannel } from "discord.js";
import { users as raUsers } from "../../data/raUsers.json";
import { Util } from "../util/Util";
import { ExtendedInteraction } from "../types/CommandTypes";

export class RetroAchievementsManager {

    public readonly defaultMinToLookBack: number = 15;

    private username: string = api.username;
    private webApiKey: string = api.key;
    private auth: AuthObject;
    private clientRef: ExtendedClient;
    private users: string[] = raUsers;

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

    public async log(str: string): Promise<void> {
        Logger.log(`[RA] ${str}`, "yellow");
    }

    // #region Achievement Feeds

    public async getRecentList(minutesToLookBack: number = this.defaultMinToLookBack): Promise<Array<achievementData>> {
        let recentList: Array<achievementData> = new Array<achievementData>;
        try {
            recentList = await RetroAchievementsApi.getRecentList(this.auth, this.users, minutesToLookBack);
        } catch (error: any) {
            throw error;
        }
        return recentList;
    }

    public async updateFeed(channelId: string, minutesToLookBack: number = this.defaultMinToLookBack) {
        // Get array of recent achievements
        let recent: achievementData[];
        try {
            recent = await this.getRecentList(minutesToLookBack);
            if (recent.length === 0) {
                this.log("No new achievements found.");
                return;
            } else {
                this.log(`Updating feed with ${recent.length} new achievement(s).`);
            }
        } catch (error: any) {
            Logger.log(error as string);
            const channel: TextChannel = this.clientRef.channels.cache.get(channelId) as TextChannel;
            await channel.send({ content: `HTTP Error ${error.response.status}: The RA servers appear to be down.` });
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
        } catch (error) {
            console.log(error);
        }
    }

    public async updateAllFeeds(minutesToLookBack: number = this.defaultMinToLookBack) {
        const guilds: Array<string> = await this.clientRef.settingsManager.getGuildIds();

        for (const guildId of guilds) {
            // Check if RA feed enabled for each guild
            if (!await this.clientRef.settingsManager.isFeatureEnabled(guildId, "raFeed")) {
                return;
            }
            // If so, get appropriate channel and create embeds
            const channelId: string = await this.clientRef.settingsManager.getChannelId(guildId, "raFeed");
            this.updateFeed(channelId, minutesToLookBack);
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
    public async sendRankingsList(listType: RARankingType, destination: string | ExtendedInteraction): Promise<void> {
        let userPointsList: Array<userPoints>;
        if (listType === "daily") {
            userPointsList = await RetroAchievementsApi.getDailyList(this.auth, this.users, true);
        } else if (listType === "weekly") {
            userPointsList = await RetroAchievementsApi.getWeeklyList(this.auth, this.users, true);
        } else {
            userPointsList = await RetroAchievementsApi.getAllTimeList(this.auth, this.users);
        } 
        const embed: EmbedBuilder = RetroAchievementsEmbeds.createRankingEmbed(userPointsList, listType);

        const message = {
            content: "Bombsquad RA Users Ranking",
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
        const guilds: Array<string> = await this.clientRef.settingsManager.getGuildIds();

        for (const guildId of guilds) {
            // Check if RA weekly recap enabled for each guild
            if (!await this.clientRef.settingsManager.isFeatureEnabled(guildId, "raWeekly")) {
                return;
            }
            const userPointsList: Array<userPoints> = await RetroAchievementsApi.getWeeklyList(this.auth, this.users, true);
            const embed: EmbedBuilder = RetroAchievementsEmbeds.createRankingEmbed(userPointsList, "weekly");
            const channelId: string = await this.clientRef.settingsManager.getChannelId(guildId, "raWeekly");
            await this.sendRankingsList("weekly", channelId);
        }
    }
}