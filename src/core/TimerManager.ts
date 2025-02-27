import { AppletonCam } from "./AppletonCam";
import { Birthdays } from "./Birthdays";
import { ExtendedClient } from "./ExtendedClient";
import { Logger } from "../util/Logger";
import later from "@breejs/later";

export class TimerManager {
    clientRef: ExtendedClient;

    constructor(client: ExtendedClient) {
        this.clientRef = client;
    }

    // https://breejs.github.io/later/parsers.html
    // https://en.wikipedia.org/wiki/Cron
    // "cron: minute hour dayofmonth month dayofweek"
    public initialize(): void {
        later.date.localTime();

        const raSchedule = later.parse.cron("*/15 * * * * ");
        const raInterval = later.setInterval(() => { this.clientRef.ra.updateAllFeeds(this.clientRef); }, raSchedule);

        const appletonCamSchedule = later.parse.cron("0 * * * *");
        const appletonCamInterval = later.setInterval(() => { AppletonCam.sendToAll(this.clientRef); }, appletonCamSchedule);

        const birthdaySchedule = later.parse.cron("0 0 * * *");
        const birthdayInterval = later.setInterval(() => { Birthdays.check(this.clientRef); }, birthdaySchedule);
    }
}