import { ExtendedClient } from "./ExtendedClient";
import { Logger } from "../util/Logger";
import { OpenWeatherMapApi } from "../integrations/OpenWeatherMap-API";
import { SeleniumWebDriver } from "../integrations/SeleniumWebDriver";
import { EmbedBuilder, TextChannel } from "discord.js";
import { Util } from "../util/Util";
import { birthdays } from "../../data/birthdays.json";
import channelIDs from "../../data/channelIDs.json";
import type { CurrentResponse } from "openweathermap-ts/dist/types";

export class TimerManager {
    clientRef: ExtendedClient;
    midnightWait: NodeJS.Timeout | null = null;
    raWait: NodeJS.Timeout | null = null;
    appCamWait: NodeJS.Timeout | null = null;

    constructor(client: ExtendedClient) {
        this.clientRef = client;
    }

    public initialize(): void {
        this.initialTimeUntilNextHalfHour();
        this.initialTimeUntilNextHour();
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

    // TODO: Rewrite all of this mess to allow for custom timers from JSON or something
    private initialTimeUntilNextHour(): void {
        const date = new Date();
        const later = new Date();
        later.setMinutes(0);
        later.setSeconds(0);
        later.setMilliseconds(0);

        // Check if need to round up
        if (date.getMinutes() > 0) {
            later.setHours(later.getHours() + 1);
        }

        const next60: number = later.getTime();
        const now: number = date.getTime();
        const remainingMS: number = next60 - now;

        const appCamToDisc = async () => {
            // Get screenshot data
            const driver: SeleniumWebDriver = new SeleniumWebDriver();
            const screenString: string = await driver.getAppletonCamScreen();
            const base64Data: string = screenString.replace(/^data:image\/png;base64,/, '');
            const buffer: Buffer = Buffer.from(base64Data, "base64");

            // Get weather info
            let owm: OpenWeatherMapApi;
            let weatherData: CurrentResponse;
            try {
                owm = new OpenWeatherMapApi();
                weatherData = await owm.getCurrentWeatherByZipcode(54911, "US");
            } catch (error) {
                console.log(error);
                return;
            }

            // Create embed
            const embed: EmbedBuilder = await owm.createEmbed(weatherData, "attachment://cam.png");

            // Send to Discord
            try {
                const channelId: string = channelIDs.bombsquad.channels.appletonCam;
                const channel: TextChannel = this.clientRef.channels.cache.get(channelId) as TextChannel;
                await channel.send({
                    embeds: [ embed ],
                    files: [{
                        attachment: buffer,
                        name: "cam.png"
                    }]
                });
            } catch (error) {
                console.log(error);
            }
        };

        const hourInMS: number = 3600000;
        this.raWait = setTimeout(() => {
            this.raWait = setInterval(() => {
                appCamToDisc();
            }, hourInMS);
            appCamToDisc();
        }, remainingMS);
    }

    private initialTimeUntilMidnight(): void {
        // Get midnight
        const later: Date = new Date();
        later.setHours(0, 0, 0, 0); // Hours, minutes, seconds, ms
        later.setDate(later.getDate() + 1); // Add a day
        later.setMinutes(1); // Add an extra minute to curb early checks
        const midnight: number = later.getTime();

        // Get current timestamp
        const now: number = new Date().getTime();

        // Subtract to get remaining time
        const remainingMS: number = midnight - now;

        const remainingTime: string = Util.msToTime(remainingMS);
        const remainingConsoleStr: string = remainingTime + " remaining until daily event checks at midnight.";
        Logger.red(remainingConsoleStr);

        const oneDayInMS: number = 86400000;
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
        Logger.logWithoutTime(Logger.bar, "red");
        Logger.log(day.toLocaleDateString("en-US", options), "red");

        this.checkBirthdays();
    }

    private async checkBirthdays(): Promise<void> {
        const channelID = channelIDs.bombsquad.channels.birthdays;

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