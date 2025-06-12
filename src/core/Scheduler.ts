import { AppletonCam } from "./AppletonCam";
import { Birthdays } from "./Birthdays";
import { ExtendedClient } from "./ExtendedClient";
import cron from "node-cron";

export class Scheduler {
    clientRef: ExtendedClient;

    constructor(client: ExtendedClient) {
        this.clientRef = client;
    }

    // https://breejs.github.io/later/parsers.html
    // https://en.wikipedia.org/wiki/Cron
    // "cron: minute hour dayofmonth month dayofweek"
    public async initialize(): Promise<void> {
        /*
        later.date.localTime();

        const midnightSchedule = later.parse.cron("0 0 * * *");
        const midnightInterval = later.setInterval(() => { this.midnightChecks() }, midnightSchedule);

        const bskyFeedMinutes: number = 10;
        const bskyFeedSchedule = later.parse.cron(`*\/${bskyFeedMinutes} * * * *`);
        const bskyFeedInterval = later.setInterval(() => { this.clientRef.bsky.updateAllFeeds(bskyFeedMinutes); }, bskyFeedSchedule);

        const raFeedMinutes: number = 10;
        const raFeedSchedule = later.parse.cron(`*\/${raFeedMinutes} * * * *`);
        const raFeedInterval = later.setInterval(() => { this.clientRef.ra.updateAllFeeds(raFeedMinutes); }, raFeedSchedule);

        const raWeeklySchedule = later.parse.cron("58 17 * * 0");
        const raWeeklyInteral = later.setInterval(() => { this.clientRef.ra.weeklyReport(); }, raWeeklySchedule);

        const appletonCamSchedule = later.parse.cron("0 * * * *");
        const appletonCamInterval = later.setInterval(() => { AppletonCam.sendToAll(this.clientRef); }, appletonCamSchedule);
        */

        cron.schedule("0 0 * * *", () => { this.midnightChecks(); });
        cron.schedule("*/10 * * * *", () => { this.clientRef.bsky.updateAllFeeds(10); });
        cron.schedule("*/10 * * * *", () => { this.clientRef.ra.updateAllFeeds(10); });
        cron.schedule("58 17 * * 0", () => { this.clientRef.ra.weeklyReport(); });
        cron.schedule("0 * * * *", () => { AppletonCam.sendToAll(this.clientRef); });
    }

    private midnightChecks(): void {
        this.clientRef.logger.rotate();
        Birthdays.check(this.clientRef);
    }
}