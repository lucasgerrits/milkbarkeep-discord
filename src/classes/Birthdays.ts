import * as fs from "fs";
import * as path from "path";
import { ExtendedClient } from "./ExtendedClient";
import { Logger } from "../util/Logger";
import type { BirthdaysJson } from "../types/GuildTypes";

export class Birthdays {
    private static async isEnabledForGuild(clientRef: ExtendedClient, guildId: string): Promise<boolean> {
        return clientRef.settingsManager.isFeatureEnabled(guildId, "birthdays");
    }

    private static async getBirthdayMessageChannel(clientRef: ExtendedClient, guildId: string): Promise<string> {
        return clientRef.settingsManager.getChannelId(guildId, "birthdays");
    }

    private static getTodayInMMDD(): string {
        const today: Date = new Date();
        const month: string = (today.getMonth() + 1).toString().padStart(2, "0"); // zero-indexed
        const day: string = today.getDate().toString().padStart(2, "0");
        const todayInMMDD: string = `${month}-${day}`;
        return todayInMMDD;
    }

    private static async getBirthdaysJsonArray(guildId: string): Promise<Array<BirthdaysJson>> {
        const filePath: string = path.resolve(__dirname, `./../../data/guilds/${guildId}`, "birthdays.json");

        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`birthdays.json file not located for guild: ${guildId}`);
            }
            
            const fileData: string = await fs.promises.readFile(filePath, 'utf-8');
            const birthdayData: Array<BirthdaysJson> = JSON.parse(fileData);
      
            return birthdayData;
        } catch (error) {
            Logger.log(error as string);
            return [];
        }
    }
    
    public static async check(clientRef: ExtendedClient): Promise<void> {
        const guilds: Array<string> = await clientRef.settingsManager.getGuildIds();

        for (const guildId of guilds) {
            // Check if birthday announcements enabled for each guild
            if (!this.isEnabledForGuild(clientRef, guildId)) {
                return;
            }

            // Get birthday data for guild then check for matches today
            const birthdays: Array<BirthdaysJson> = await this.getBirthdaysJsonArray(guildId);
            const todayInMMDD: string = this.getTodayInMMDD();
            const resultIDs: string[] = birthdays.filter(obj => obj.date === todayInMMDD).map(obj => obj.userId);
            const resultTags: string[] = birthdays.filter(obj => obj.date === todayInMMDD).map(obj => `<@${obj.userId}>`);

            // Then post birthday message to channel
            const channelId: string = await this.getBirthdayMessageChannel(clientRef, guildId);
            if (resultIDs.length > 0) {
                const lf: Intl.ListFormat = new Intl.ListFormat("en");
                const botStr: string = "Today it's " + lf.format(resultTags) + "'s birthday! POGGGG";
                clientRef.send(channelId, {
                        "content": botStr,
                        "allowedMentions": { "users": [ ...resultIDs ] },
                })
            }
        }
    }
}