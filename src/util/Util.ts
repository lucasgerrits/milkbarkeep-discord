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

    static async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static sleepInSeconds(seconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
}