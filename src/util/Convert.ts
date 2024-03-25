export class Convert {
    // TEMPERATURE
    public static cToF(celsius: number): number {
        return ((9 / 5) * celsius) + 32;
    }

    public static fToC(fahrenheit: number): number {
        return (fahrenheit - 32) * (5 / 9);
    }

    // ACCELERATION
    public static mpsToMph(metersPerSecond: number): number {
        return metersPerSecond * 2.23694;
    }

    public static mphToMps(milesPerHour: number): number {
        return milesPerHour * 0.44704;
    }

    // DIRECTION
    public static degreesToCompass(degrees: number): string {
        const directions: Array<string> = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
        const index: number = Math.round(degrees / 45) % 8;
        return directions[index];
    }
}