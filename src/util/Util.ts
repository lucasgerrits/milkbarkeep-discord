export class Util {
    static chunkArray(arr: Array<any>, size: number): Array<any> {
        const chunks: Array<any> = [];
        for (let i: number = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, size));
        }
        return chunks;
    }

    static getRandomIntegerInclusive(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); // Min and max are inclusive
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

    static async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static sleepInSeconds(seconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
}