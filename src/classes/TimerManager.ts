import { ExtendedClient } from "./ExtendedClient";


export class TimerManager {
    clientRef: ExtendedClient;
    midnightWait: NodeJS.Timeout | null = null;
    raWait: NodeJS.Timeout | null = null;

    constructor(client: ExtendedClient) {
        this.clientRef = client;

        this.initialTimeUntilNextHalfHour();
    }

    private initialTimeUntilNextHalfHour() {
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
}