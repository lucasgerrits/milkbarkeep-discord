export class Convert {
    public static cToF(c: number): number {
        return ((9 / 5) * c) + 32;
    }

    public static fToC(f: number): number {
        return (f - 32) * (5 / 9);
    }
}