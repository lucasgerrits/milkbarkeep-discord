import * as fs from "fs";

export class Util {
    static chunkArray(arr: Array<any>, chunkSize: number): Array<any> {
        const newArr: Array<any> = [];
        for (let i: number = 0; i < arr.length; i += chunkSize) {
            newArr.push(arr.slice(i, i + chunkSize));
        }
        return newArr;
    }

    static getRandomIntegerInclusive(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); // Min and max are inclusive
    }

    static gmtStringToCTDateObj(dateTimeStr: string): Date {
        const sixHoursInMillis: number = (6 * 60 * 60 * 1000);
        const newTimestamp: number = (new Date(dateTimeStr)).getTime() - sixHoursInMillis;
        return new Date(newTimestamp);
    }

    static msToTime(duration: number): string {
        const milliseconds: number = Math.floor((duration % 1000) / 100);
        const seconds: number = Math.floor((duration / 1000) % 60);
        const minutes: number = Math.floor((duration / (1000 * 60)) % 60);
        const hours: number = Math.floor((duration / (1000 * 60 * 60)) % 24);

        const hoursStr: string = (hours < 10) ? "0" + hours : hours.toString();
        const minutesStr: string = (minutes < 10) ? "0" + minutes : minutes.toString();
        const secondsStr: string = (seconds < 10) ? "0" + seconds : seconds.toString();

        return hoursStr + ":" + minutesStr + ":" + secondsStr + "." + milliseconds;
    }

    static readJsonSync(fileName: string): unknown | null {
        try {
            const data: string = fs.readFileSync(fileName, "utf8");
            try{
                return JSON.parse(data);
            } catch (parseError) {
                console.error("Error parsing JSON: ", parseError);
            }
        } catch (readError) {
            console.error("Error reading file: ", readError);
        }
    }

    static async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static sleepInSeconds(seconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
}