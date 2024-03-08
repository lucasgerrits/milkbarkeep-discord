import * as fs from "fs";
import { User } from "discord.js";

export class Oddball {
    private jsonFile: string = `${__dirname}/../../data/oddballStats.json`;
    private oddballArr: Array<OddballData>;
    private interactionUser: User;
    public dropUser: OddballData | undefined;
    public pickupUser: OddballData;

    constructor(interactionUser: User) {
        this.oddballArr = this.readJson() ?? [];
        console.log(this.oddballArr);
        this.interactionUser = interactionUser;
        this.dropUser = this.updateDropUser();
        this.pickupUser = this.updateOrAddPickupUser();
        this.sortArr();
        this.writeJson();
    }

    private readJson(): Array<OddballData> | void {
        console.log(this.jsonFile);
        try {
            const data: string = fs.readFileSync(this.jsonFile, "utf8");
            try{
                console.log(data);
                return JSON.parse(data);
            } catch (parseError) {
                console.error("Error parsing JSON: ", parseError);
            }
        } catch (readError) {
            console.error("Error reading file: ", readError);
        }
    }

    private writeJson(): void {
        const updatedData = JSON.stringify(this.oddballArr, null, 4);
        console.log(updatedData);
        fs.writeFile(this.jsonFile, updatedData, "utf8", (err) => {
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
        console.log(userIDToLocate);
        const foundIndex = this.oddballArr.findIndex(obj => obj[propName] === propValue);
        return foundIndex;
    }

    // Find previous oddball holder
    private getDropUserIndex(): number {
        // Properties to search for
        const propName = "hasBall";
        const propValue = true;
        const foundIndex = this.oddballArr.findIndex(obj => obj[propName] === propValue);
        console.log(foundIndex);
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
            this.oddballArr[userIndex].score += scoreToAdd;
        }
    }

    private updateDropUser(): OddballData | undefined {
        const lastDropTimestamp: string = new Date().toISOString();
        const userIndex: number = this.getDropUserIndex();
        console.log(userIndex);
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
            console.log(this.oddballArr);
            return newUser;
        } else {
            // Update existing user
            this.oddballArr[userIndex].lastPickup = lastPickupTimestamp;
            this.oddballArr[userIndex].hasBall = true;
            return this.oddballArr[userIndex];
        }
    }
}