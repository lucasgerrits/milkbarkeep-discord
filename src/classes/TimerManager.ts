import { ExtendedClient } from "./ExtendedClient";
import { Logger } from "../util/Logger";
import { Util } from "../util/Util";
import { birthdays } from "../../data/birthdays.json";
import channelIDs from "../../data/channelIDs.json";
import { TextChannel } from "discord.js";

export class TimerManager {
    clientRef: ExtendedClient;
    midnightWait: NodeJS.Timeout | null = null;
    raWait: NodeJS.Timeout | null = null;

    constructor(client: ExtendedClient) {
        this.clientRef = client;
    }

    public initialize(): void {
        this.initialTimeUntilNextHalfHour();
        this.initialTimeUntilMidnight();
    }

    // #region Determine Waits

    private initialTimeUntilNextHalfHour(): void {
        // Get nearest 00/30/60 minutes
        const later: Date = new Date();
        later.setMinutes(Math.ceil(later.getMinutes() / 30) * 30);
        const next30: number = later.getTime();

        // Get current timestamp
        const now: number = new Date().getTime();

        // Subtract to get remaining time
        const remainingMS: number = next30 - now;

        const halfHourInMS: number = 1800000;
        this.raWait = setTimeout(() => {
            this.raWait = setInterval(() => {
                this.clientRef.ra.updateFeed(this.clientRef);
            }, halfHourInMS);
            this.clientRef.ra.updateFeed(this.clientRef);
        }, remainingMS);
    }

    private initialTimeUntilMidnight(): void {
        // Get midnight
        const later = new Date();
        later.setHours(24, 1, 0, 0); // hours, minutes, seconds, ms
        const midnight = later.getTime();

        // Get current timestamp
        const now = new Date().getTime();

        // Subtract to get remaining time
        const remainingMS = midnight - now;

        const remainingTime = Util.msToTime(remainingMS);
        const remainingStr = remainingTime + " remaining until daily event checks at midnight.";
        Logger.red(remainingStr);
        // client.channels.cache.get("95663899566669824").send(remainingStr);

        const oneDayInMS = 86400000;
        this.midnightWait = setTimeout(() => {
            this.midnightWait = setInterval(() => {
                this.midnightActivities();
            }, oneDayInMS);
            this.midnightActivities();
        }, remainingMS);
    }

    // #endregion

    // #region Timer Handlers

    private async midnightActivities(): Promise<void> {
        const day: Date = new Date();
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        Logger.logWithoutTime(day.toLocaleDateString("en-US", options), "red");

        this.checkBirthdays();
    }

    private async checkBirthdays(): Promise<void> {
        const channelID = channelIDs.birthdays;

        const today: Date = new Date();
        const month: string = (today.getMonth() + 1).toString().padStart(2, "0"); // zero-indexed
        const day: string = today.getDate().toString().padStart(2, "0");
        const todayInMMDD: string = `${month}-${day}`;

        const resultIDs: string[] = birthdays.filter(obj => obj.date === todayInMMDD).map(obj => obj.userID);
        const resultTags: string[] = birthdays.filter(obj => obj.date === todayInMMDD).map(obj => `<@${obj.userID}>`);

        if (resultIDs.length > 0) {
            const lf: Intl.ListFormat = new Intl.ListFormat("en");
            const botStr: string = "Today it's " + lf.format(resultTags) + "'s birthday! POGGGG";
            try {
                const channel: TextChannel = this.clientRef.channels.cache.get(channelID) as TextChannel;
                await channel.send({
                    "content": botStr,
                    "allowedMentions": { "users": [ ...resultIDs ] },
                });
            } catch (error) {
                console.log(error);
            }
        }
    }
}