import { AppletonCam } from "./AppletonCam";
import { Birthdays } from "./Birthdays";
import { ExtendedClient } from "./ExtendedClient";
import { Logger } from "../util/Logger";
import later from "@breejs/later";

export class TimerManagerV2 {
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
        const raInterval = later.setInterval(() => { this.clientRef.ra.updateFeed(this.clientRef); }, raSchedule);

        const appletonCamSchedule = later.parse.cron("0 * * * *");
        const appletonCamInterval = later.setInterval(() => { AppletonCam.postToDisc(this.clientRef); }, appletonCamSchedule);

        const birthdaySchedule = later.parse.cron("0 0 * * *");
        const birthdayInterval = later.setInterval(() => { Birthdays.check(this.clientRef); }, birthdaySchedule);
    }
}