import { TimestampStylesString, time } from "discord.js";

export class Timestamps {

    /**
     * Discord timestamps can be useful for specifying a date/time across multiple users time zones. 
     * They work with the Unix Timestamp format and can be posted by regular users as well as bots and applications.
     * https://gist.github.com/LeviSnoot/d9147767abeef2f770e9ddcd91eb85aa
     * https://old.discordjs.dev/#/docs/discord.js/14.14.1/typedef/TimestampStylesString
     */
    private static format(unixEpochTimestamp: Date | number, styleString?: TimestampStylesString): string {
        let dateToFormat: Date;
        if (typeof unixEpochTimestamp === "number") {
            dateToFormat = new Date(unixEpochTimestamp);
        } else {
            dateToFormat = unixEpochTimestamp;
        }

        if (styleString === undefined) {
            return time(dateToFormat);
        } else {
            return time(dateToFormat, styleString);
        }
    }

    /**
     * [ 20 April 2021 16:20 ]
     * Default time format.
     */
    public static default(timestamp: Date | number): string {
        return Timestamps.format(timestamp);
    }

    /**
     * [ 16:20 ]
     * Short time format, consisting of hours and minutes.
     */
    public static shortTime(timestamp: Date | number): string {
        return Timestamps.format(timestamp, "t");
    }

    /**
     * [ 16:20:30 ]
     * Long time format, consisting of hours, minutes, and seconds.
     */
    public static longTime(timestamp: Date | number): string {
        return Timestamps.format(timestamp, "T");
    }

    /**
     * [ 20/04/2021 ]
     * Short date format, consisting of day, month, and year.
     */
    public static shortDate(timestamp: Date | number): string {
        return Timestamps.format(timestamp, "d");
    }

    /**
     * [ 20 April 2021 ]
     * Long date format, consisting of day, month, and year.
     */
    public static longDate(timestamp: Date | number): string {
        return Timestamps.format(timestamp, "D");
    }

    /**
     * [ 20 April 2021 16:20 ]
     * Short date-time format, consisting of short date and short time formats.Short date-time format, consisting of short date and short time formats.
     */
    public static shortDateTime(timestamp: Date | number): string {
        return Timestamps.format(timestamp, "f");
    }

    /**
     * [ Tuesday, 20 April 2021 16:20 ]
     * Long date-time format, consisting of long date and short time formats.
     */
    public static longDateTime(timestamp: Date | number): string {
        return Timestamps.format(timestamp, "F");
    }

    /**
     * [ 2 months ago ]
     * Relative time format, consisting of a relative duration format.
     */
    public static relative(timestamp: Date | number): string {
        return Timestamps.format(timestamp, "R");
    }
}