import { 
    AchievementUnlocksMetadata,
    AuthObject, 
    DatedUserAchievement, 
    GameExtended, 
    UserPoints, 
    UserRecentAchievement, 
    buildAuthorization, 
    getAchievementUnlocks, 
    getAchievementsEarnedBetween, 
    getAchievementsEarnedOnDay, 
    getGameExtended, 
    getUserPoints,
    getUserRecentAchievements
} from "@retroachievements/api";
import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import { ExtendedClient } from "../core/ExtendedClient";
import { Logger } from "../util/Logger";
import { Timestamps } from "../core/Timestamps";
import { Util } from "../util/Util";
import { retroAchievements as api } from "../../data/apiKeys.json";
import { users as raUsers } from "../../data/raUsers.json";
import type { achievementData, userPoints } from "../types/RATypes";

export class RetroAchievementsApi {
    private defaultMinToLookBack: number = 15;
    private callDelayInMS: number = 175;
    private gmtOffsetInMS: number = 21600000;
    private username: string = api.username;
    private webApiKey: string = api.key;
    private users: string[] = raUsers;
    private auth: AuthObject;

    /**
     * Docs: https://api-docs.retroachievements.org/getting-started.html#quick-start-client-library
     */
    constructor() {
        this.auth = buildAuthorization({
            "username": this.username,
            "webApiKey": this.webApiKey,
        });
    }

    public async log(str: string): Promise<void> {
        Logger.log(`[RA] ${str}`, "yellow");
    }

    // #region API CALLS

    /**
     * Docs: https://api-docs.retroachievements.org/v1/get-achievement-unlocks.html
     * Repo: https://github.com/RetroAchievements/api-js/blob/main/src/achievement/getAchievementUnlocks.ts
     */
    public async getAchievementUnlocks(id: number, count: number = 0, offset: number = 50): Promise<AchievementUnlocksMetadata> {
        const achievement: AchievementUnlocksMetadata = await getAchievementUnlocks(this.auth, {
            achievementId: id,
            count: count,
            offset: offset,
        });
        return achievement;
    }

    /**
     * Docs: https://api-docs.retroachievements.org/v1/get-game-extended.html
     * Repo: https://github.com/RetroAchievements/api-js/blob/main/src/game/getGameExtended.ts
     */
    public async getGameExtended(id: number, unofficialSet: boolean = false): Promise<GameExtended> {
        const game: GameExtended = await getGameExtended(this.auth, {
            gameId: id,
            isRequestingUnofficialAchievements: unofficialSet
        });
        return game;
    }

    /**
     * Docs: https://api-docs.retroachievements.org/v1/get-user-points.html
     * Repo: https://github.com/RetroAchievements/api-js/blob/main/src/user/getUserPoints.ts
     */
    public async getAllTimeList(): Promise<Array<userPoints>> {
        const allTime: Array<userPoints> = [];
        for (const user of this.users) {
            const userPoints: UserPoints = await getUserPoints(this.auth, {
                username: user,
            });
            allTime.push({ username: user, points: userPoints.points });
            await Util.sleep(this.callDelayInMS);
        }
        allTime.sort((a: userPoints, b: userPoints) => b.points - a.points);
        return allTime;
    }

    /**
     * Docs: https://api-docs.retroachievements.org/v1/get-achievements-earned-on-day.html
     * Repo: https://github.com/RetroAchievements/api-js/blob/main/src/user/getAchievementsEarnedOnDay.ts
     */
    public async getDailyList(): Promise<Array<userPoints>> {
        const daily: Array<userPoints> = [];
        const nowGMT: number = Date.now() + this.gmtOffsetInMS;
        const onDate: Date = new Date(nowGMT);
        for (const user of this.users) {
            const userEarnedOnDay: DatedUserAchievement[] = await getAchievementsEarnedOnDay(
                this.auth, {
                    username: user,
                    onDate: onDate,
            }); // onDate: new Date(new Date().toUTCString()),
            const userPoints: number = (userEarnedOnDay.length > 0) ?
                (userEarnedOnDay.pop()?.cumulScore ?? 0) : 0;
            daily.push({ username: user, points: userPoints });
            await Util.sleep(this.callDelayInMS);
        }
        daily.sort((a: userPoints, b: userPoints) => b.points - a.points);
        return daily;
    }

    /**
     * Docs: https://api-docs.retroachievements.org/v1/get-achievements-earned-between.html
     * Repo: https://github.com/RetroAchievements/api-js/blob/main/src/user/getAchievementsEarnedBetween.ts
     */
    public async getWeeklyList(): Promise<Array<userPoints>> {
        const weekly: Array<userPoints> = [];
        const nowGMT: number = Date.now() + this.gmtOffsetInMS;
        const toDate: Date = new Date(nowGMT);
        const getLastSunday = (dateIn: Date): Date => {
            const dateOut: Date = new Date(dateIn);
            dateOut.setDate(dateOut.getDate() - dateOut.getDay());
            return dateOut;
        };
        const fromDate: Date = new Date(getLastSunday(toDate).toUTCString());
        fromDate.setUTCHours(0, 0, 0, 0);
        for (const user of this.users) {
            const userEarnedBetween: DatedUserAchievement[] = await getAchievementsEarnedBetween(this.auth, {
                username: user,
                fromDate: fromDate,
                toDate: toDate,
            });
            const userPoints: number = (userEarnedBetween.length > 0) ?
                (userEarnedBetween.pop()?.cumulScore ?? 0) : 0;
            weekly.push({ username: user, points: userPoints });
            await Util.sleep(this.callDelayInMS);
        }
        weekly.sort((a: userPoints, b: userPoints) => b.points - a.points);
        return weekly;
    }

    /**
     * Docs: https://api-docs.retroachievements.org/v1/get-user-recent-achievements.html
     * Repo: https://github.com/RetroAchievements/api-js/blob/main/src/user/getUserRecentAchievements.ts
     */
    public async getRecentList(client: ExtendedClient, channelId: string, minutesToLookBack: number = this.defaultMinToLookBack): Promise<Array<achievementData>> {
        // Request normally defaults to 60
        const recent: achievementData[] = [];
        try {
            for (const user of this.users) {
                const userEarnedRecent: UserRecentAchievement[] = await getUserRecentAchievements(this.auth, {
                    username: user,
                    recentMinutes: minutesToLookBack,
                });
                for (const achievement of userEarnedRecent) {
                    recent.push({ ...achievement, username: user });
                }
                // recent.push(...userEarnedRecent);
                await Util.sleep(this.callDelayInMS);
            }
            recent.sort((a: achievementData, b: achievementData) => {
                if (a.date > b.date) {
                    return -1;
                } else if (b.date < a.date) {
                    return 1;
                } else {
                    return 0;
                }
            });
            recent.reverse();
        } catch (error: any) {
            console.error("An error occurred while fetching user recent achievements: ", error);
            if (error.response && error.response.status) {
                console.log("Status code: ", error.response.status);
                // Server error range
                if (error.response.status >= 500 && error.response.status < 600) {
                    const channel: TextChannel = client.channels.cache.get(channelId) as TextChannel;
                    await channel.send({ content: `HTTP Error ${error.response.status}: The RA servers appear to be down.` });
                }
            }
        }
        return recent;
    }

    // #endregion

    // #region Discord Embeds

    private determinePointValueColor(amount: number): string {
        if (amount <= 9) {
            return "#1EFF0C"; // green
        } else if (amount <= 19) {
            return "#0070FF"; // blue
        } else if (amount <= 49) {
            return "#A335EE"; // purple
        } else if (amount <= 99) {
            return "#FF8000"; // orange
        } else {
            return "#FF3F40"; // red
        }
    }

    public async createAchievementEmbed(data: achievementData): Promise<EmbedBuilder> {
        // DATA STRING FORMATTING
        const baseURL: string = "https://www.retroachievements.org/";
        const avatarURL: string = "https://media.retroachievements.org/UserPic/" +
            data.username + ".png";
        const profileURL: string = baseURL + "user/" + data.username;
        const badgeURL: string = baseURL + data.badgeUrl;
        const gameURL: string = baseURL + "game/" + data.gameId;
        const gameString: string = `[${data.gameTitle}](${gameURL})\n${data.consoleName}`;
        const achievementUrl: string = baseURL + "achievement/" + data.achievementId;
        const achievementString: string = `${data.title} (${data.points})`;
        const color: ColorResolvable = this.determinePointValueColor(data.points) as ColorResolvable;
        const centralUSDate = Util.gmtStringToCTDateObj(data.date);
        const discordTimestamp: string = Timestamps.default(centralUSDate);

        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(color)
            .setTitle(achievementString)
            .setURL(achievementUrl)
            .setAuthor({
                name: data.username,
                iconURL: avatarURL,
                url: profileURL,
            })
            .setDescription(data.description)
            .setThumbnail(badgeURL)
            .addFields(
                { name: "Game:", value: gameString, inline: false },
                { name: "DateTime (GMT/RA):", value: data.date, inline: true },
                { name: "DateTime (Yours):", value: discordTimestamp, inline: true },
            );
        return embed;
    }

    public async updateFeed(client: ExtendedClient, channelId: string, minutesToLookBack: number = this.defaultMinToLookBack) {
        // Get array of recent achievements
        let recent: achievementData[];
        try {
            recent = await this.getRecentList(client, channelId, minutesToLookBack);
            if (recent.length === 0) {
                this.log("No new achievements found.");
                return;
            } else {
                this.log(`Updating feed with ${recent.length} new achievement(s).`);
            }
        } catch (err) {
            console.log(err);
            return;
        }

        // For each result, create a new embed
        const embeds: EmbedBuilder[] = [];
        for (const row of recent) {
            const embed: EmbedBuilder = await this.createAchievementEmbed(row);
            embeds.push(embed);
        }
        const chunkedEmbeds: Array<EmbedBuilder[]> = Util.chunkArray(embeds, 10);

        // Send all embeds in one message to chat
        try {
            const channel: TextChannel = client.channels.cache.get(channelId) as TextChannel;
            for (const chunk of chunkedEmbeds) {
                await channel.send({
                    embeds: chunk,
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async updateAllFeeds(clientRef: ExtendedClient, minutesToLookBack: number = this.defaultMinToLookBack) {
        const guilds: Array<string> = await clientRef.settingsManager.getGuildIds();

        for (const guildId of guilds) {
            // Check if RA feed enabled for each guild
            if (!await clientRef.settingsManager.isFeatureEnabled(guildId, "raFeed")) {
                return;
            }
            const channelId: string = await clientRef.settingsManager.getChannelId(guildId, "raFeed");
            this.updateFeed(clientRef, channelId, minutesToLookBack);
        }
    }

    // #endregion
}