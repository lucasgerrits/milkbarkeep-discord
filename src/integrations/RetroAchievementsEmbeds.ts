import { ColorResolvable, EmbedBuilder } from "discord.js";
import { Util } from "../util/Util";
import { Timestamps } from "../core/Timestamps";
import type { achievementData, RARankingType, userPoints } from "../types/RATypes";
import { AchievementUnlocksMetadata, GameExtended } from "@retroachievements/api";

export class RetroAchievementsEmbeds {

    // #region Rankings

    public static createRankingEmbed(userPointsList: Array<userPoints>, listType: RARankingType): EmbedBuilder {
        const embedLabel: string = listType.toString().replace(/-/g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        const rankingString: string = this.createRankingString(userPointsList);
        const thumbnail: string = "https://static.retroachievements.org/assets/images/ra-icon.webp";
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor("#cc9900")
            .setThumbnail(thumbnail)
            .setTitle(embedLabel)
            .setDescription(rankingString);
        return embed;
    }

    private static createRankingString(userPointsList: userPoints[]): string {
        const profileURL = "https://www.retroachievements.org/user/";
        let output = "";
        for (let i = 0; i < userPointsList.length; i++) {
            output += `${i + 1}. [${userPointsList[i].username}]` +
                `(${profileURL}${userPointsList[i].username}): ` +
                `${userPointsList[i].points}\n`;
        }
        return output;
    }

    // #region Achievements

    private static determinePointValueColor(amount: number): string {
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

    public static async createFeedAchievementEmbed(data: achievementData): Promise<EmbedBuilder> {
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

    public static createIdAchievementEmbed(achId: number, achData: AchievementUnlocksMetadata, gameData: GameExtended): EmbedBuilder {
        const webURL: string = `https://retroachievements.org/achievement/${achId}`;
        const badgeName: string = gameData.achievements[achId].badgeName;
        const badgeUrl: string = `https://media.retroachievements.org/Badge/${badgeName}.png`;
        const titleStr: string = `${achData.achievement.title} (${achData.achievement.points})`;
        const pointsStr: string = `${achData.achievement.points} (${achData.achievement.trueRatio})`;
        const percentStr: string = `${((achData.unlocksCount / achData.totalPlayers) * 100).toFixed(2)}%`;
        const unlocksStr: string = `${achData.unlocksCount} of ${achData.totalPlayers}\n${percentStr} rate`;
        const gameUrl: string = `https://www.retroachievements.org/game/${achData.game.id}`
        const gameString: string = `[${achData.game.title}](${gameUrl})\n${achData.console.title}`;
        const darkGray: ColorResolvable = "#1E1F22";
        const raYellow: ColorResolvable = "#cc9900";

        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(darkGray)
            .setTitle(titleStr)
            .setURL(webURL)
            .setDescription(achData.achievement.description)
            .setThumbnail(badgeUrl)
            .setFields(
                { name: "Game:", value: gameString, inline: true },
                { name: "Unlocks:", value: unlocksStr, inline: true },
            );
        return embed;
    }
    
}