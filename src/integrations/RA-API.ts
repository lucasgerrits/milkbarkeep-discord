import { 
    AuthObject, 
    DatedUserAchievement, 
    UserPoints, 
    UserRecentAchievement, 
    buildAuthorization, 
    getAchievementsEarnedBetween, 
    getAchievementsEarnedOnDay, 
    getUserPoints,
    getUserRecentAchievements
} from "@retroachievements/api";
import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import { ExtendedClient } from "../classes/ExtendedClient";
import { Logger } from "../util/Logger";
import { Util } from "../util/Util";
import { retroAchievements as api } from "../../data/apiKeys.json";
import { users as raUsers } from "../../data/raUsers.json";
import channelIDs from "../../data/channelIDs.json";
import type { achievementData, userPoints } from "../types/RATypes";

export class RetroAchievementsApi {
    private callDelayInMS: number = 175;
    private gmtOffsetInMS: number = 21600000;
    private userName: string = api.username;
    private webApiKey: string = api.key;
    private users: string[] = raUsers;
    private auth: AuthObject;

    /**
     * Docs: https://api-docs.retroachievements.org/getting-started.html#quick-start-client-library
     */
    constructor() {
        this.auth = buildAuthorization({
            "userName": this.userName,
            "webApiKey": this.webApiKey,
        });
    }

    public async log(str: string): Promise<void> {
        Logger.log(`[RA] ${str}`, "yellow");
    }

    // #region API CALLS

    /**
     * Docs: https://api-docs.retroachievements.org/v1/get-user-points.html
     * Repo: https://github.com/RetroAchievements/api-js/blob/main/src/user/getUserPoints.ts
     */
    public async getAllTimeList(): Promise<Array<userPoints>> {
        const allTime: Array<userPoints> = [];
        for (const user of this.users) {
            const userPoints: UserPoints = await getUserPoints(this.auth, {
                userName: user,
            });
            allTime.push({ userName: user, points: userPoints.points });
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
                    userName: user,
                    onDate: onDate,
            }); // onDate: new Date(new Date().toUTCString()),
            const userPoints: number = (userEarnedOnDay.length > 0) ?
                (userEarnedOnDay.pop()?.cumulScore ?? 0) : 0;
            daily.push({ userName: user, points: userPoints });
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
                userName: user,
                fromDate: fromDate,
                toDate: toDate,
            });
            const userPoints: number = (userEarnedBetween.length > 0) ?
                (userEarnedBetween.pop()?.cumulScore ?? 0) : 0;
            weekly.push({ userName: user, points: userPoints });
            await Util.sleep(this.callDelayInMS);
        }
        weekly.sort((a: userPoints, b: userPoints) => b.points - a.points);
        return weekly;
    }

    /**
     * Docs: https://api-docs.retroachievements.org/v1/get-user-recent-achievements.html
     * Repo: https://github.com/RetroAchievements/api-js/blob/main/src/user/getUserRecentAchievements.ts
     */
    public async getRecentList(minutesToLookBack: number = 30): Promise<Array<achievementData>> {
        // Request normally defaults to 60
        const recent: achievementData[] = [];
        for (const user of this.users) {
            const userEarnedRecent: UserRecentAchievement[] = await getUserRecentAchievements(this.auth, {
                userName: user,
                recentMinutes: minutesToLookBack,
            });
            for (const achievement of userEarnedRecent) {
                recent.push({ ...achievement, userName: user });
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
            data.userName + ".png";
        const profileURL: string = baseURL + "user/" + data.userName;
        const badgeURL: string = baseURL + data.badgeUrl;
        const gameURL: string = baseURL + "game/" + data.gameId;
        const gameString: string = `[${data.gameTitle}](${gameURL})`;
        const achievementURL: string = baseURL + "achievement/" + data.achievementId;
        const achievementString: string = `${data.title} (${data.points})`;
        const color: ColorResolvable = this.determinePointValueColor(data.points) as ColorResolvable;

        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(color)
            .setTitle(achievementString)
            .setURL(achievementURL)
            .setAuthor({
                name: data.userName,
                iconURL: avatarURL,
                url: profileURL,
            })
            .setDescription(data.description)
            .setThumbnail(badgeURL)
            .addFields(
                { name: "Game:", value: gameString, inline: false },
                { name: "Date:", value: data.date, inline: true },
                { name: "Console:", value: data.consoleName, inline: true },
            );
        return embed;
    }

    public async updateFeed(client: ExtendedClient, channelID: string = channelIDs.raFeed, minutesToLookBack: number = 30) {
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
        console.log(chunkedEmbeds);

        // Send all embeds in one message to chat
        try {
            const channel: TextChannel = client.channels.cache.get(channelID) as TextChannel;
            for (const chunk of chunkedEmbeds) {
                await channel.send({
                    embeds: chunk,
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    // #endregion
}