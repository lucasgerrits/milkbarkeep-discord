import * as fs from "fs";
import { User } from "discord.js";
import { Util } from "../util/Util";

export class Oddball {
    private static jsonFile: string = `${__dirname}/../../data/oddballStats.json`;
    private oddballArr: Array<OddballData>;
    private interactionUser: User;
    public dropUser: OddballData | undefined;
    public pickupUser: OddballData;

    constructor(interactionUser: User) {
        this.oddballArr = Oddball.readJson() ?? [];
        this.interactionUser = interactionUser;
        this.dropUser = this.updateDropUser();
        this.pickupUser = this.updateOrAddPickupUser();
        this.sortArr();
        this.writeJson();
    }

    public static readJson(): Array<OddballData> | null {
        try {
            return Util.readJsonSync(Oddball.jsonFile) as Array<OddballData>;
        } catch (parseError) {
            console.error("Error parsing JSON: ", parseError);
            return null;
        }
    }

    private writeJson(): void {
        const updatedData = JSON.stringify(this.oddballArr, null, 4);
        fs.writeFile(Oddball.jsonFile, updatedData, "utf8", (err) => {
            if (err) {
                console.error("Error writing file: ", err);
                return;
            }
        });
    }

    private sortArr(): void {
        // Descending order
        this.oddballArr = this.oddballArr.sort((a: OddballData, b: OddballData) => b.score - a.score);
        for (let i = 0; i < this.oddballArr.length; i++) {
            this.oddballArr[i].rank = i + 1;
        }
    }

    // Find new oddball holder
    private getPickupUserIndex(userIDToLocate: string): number {
        // Properties to search for
        const propName = "userID";
        const propValue = userIDToLocate;
        const foundIndex = this.oddballArr.findIndex(obj => obj[propName] === propValue);
        return foundIndex;
    }

    // Find previous oddball holder
    private getDropUserIndex(): number {
        // Properties to search for
        const propName = "hasBall";
        const propValue = true;
        const foundIndex = this.oddballArr.findIndex(obj => obj[propName] === propValue);
        return foundIndex;
    }

    // Used to calculate score adjustments
    private getSecondsDifference(isoString1: string, isoString2: string): number {
        const date1: Date = new Date(isoString1);
        const date2: Date = new Date(isoString2);
        const differenceInSeconds: number = Math.floor(Math.abs((date2.getTime() - date1.getTime()) / 1000));
        return differenceInSeconds;
    }

    private updateScore(userIndex: number): void {
        let scoreToAdd: number = 0;
        if (this.oddballArr[userIndex].lastDrop) {
            const lastPickup: string = this.oddballArr[userIndex].lastPickup as string;
            const lastDrop: string = this.oddballArr[userIndex].lastDrop as string;
            scoreToAdd = this.getSecondsDifference(lastDrop, lastPickup);
            this.oddballArr[userIndex].lastIncrease = scoreToAdd;
            this.oddballArr[userIndex].score += scoreToAdd;
        }
    }

    private updateDropUser(): OddballData | undefined {
        const lastDropTimestamp: string = new Date().toISOString();
        const userIndex: number = this.getDropUserIndex();
        if (userIndex === -1) {
            return undefined;
        } else {
            this.oddballArr[userIndex].lastDrop = lastDropTimestamp;
            this.oddballArr[userIndex].hasBall = false;
            this.updateScore(userIndex);
            return this.oddballArr[userIndex];
        }
    }

    private updateOrAddPickupUser(): OddballData {
        const lastPickupTimestamp: string = new Date().toISOString();
        const userIndex: number = this.getPickupUserIndex(this.interactionUser.id);
        if (userIndex === -1) {
            // Create new user
            const newUser: OddballData = {
                userID: this.interactionUser.id,
                userName: this.interactionUser.displayName,
                score: 0,
                lastPickup: lastPickupTimestamp,
                hasBall: true,
                rank: this.oddballArr.length + 1,
            }
            this.oddballArr.push(newUser);
            return newUser;
        } else {
            // Update existing user
            this.oddballArr[userIndex].lastPickup = lastPickupTimestamp;
            this.oddballArr[userIndex].hasBall = true;
            return this.oddballArr[userIndex];
        }
    }
}