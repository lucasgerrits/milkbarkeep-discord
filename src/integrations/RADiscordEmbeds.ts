import { EmbedBuilder } from "discord.js";
import { ExtendedClient } from "../core/ExtendedClient";
import type { RARankingType, userPoints } from "../types/RATypes";

export class RADiscordEmbeds {

    public static async createRankingEmbed(clientRef: ExtendedClient, listType: RARankingType) {
        let userPointsList: userPoints[];
        let embedLabel: string;
        try {
            if (listType === "daily") {
                userPointsList = await clientRef.ra.getDailyList(true);
                embedLabel = "Daily";
            } else if (listType === "weekly") {
                userPointsList = await clientRef.ra.getWeeklyList(true);
                embedLabel = "Weekly";
            } else {
                userPointsList = await clientRef.ra.getAllTimeList();
                embedLabel = "All Time";
            }
        } catch (error) {
            throw error;
        }
        const rankingString: string = this.createRankingString(userPointsList);
        return this.createRAEmbed(embedLabel, rankingString);
    }

    private static async createRAEmbed(label: string, descriptStr: string): Promise<EmbedBuilder> {
        const thumbnail: string = "https://static.retroachievements.org/assets/images/ra-icon.webp";
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor("#cc9900")
            .setThumbnail(thumbnail)
            .setTitle(label)
            .setDescription(descriptStr);
        return embed;
    };

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
    
}