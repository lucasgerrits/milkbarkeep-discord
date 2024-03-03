export class Logger {
    private static DEBUG: boolean = true;
    private static colors: {
        foreground: {
            [key: string]: number;
        },
        background: {
            [key: string]: number;
        }
    } = {
        "foreground": {
            "default": 39,
            "black": 30,
            "red": 31,
            "green": 32,
            "yellow": 33,
            "blue": 34,
            "magenta": 35,
            "cyan": 36,
            "white": 37,
            "brightBlack": 90,
            "brightRed": 91,
            "brightGreen": 92,
            "brightYellow": 93,
            "brightBlue": 94,
            "brightMagenta": 95,
            "brightCyan": 96,
            "brightWhite": 97,
        },
        "background": {
            "default": 49,
            "black": 40,
            "red": 41,
            "green": 42,
            "yellow": 43,
            "blue": 44,
            "magenta": 45,
            "cyan": 46,
            "white": 47,
            "brightBlack": 100,
            "brightRed": 101,
            "brightGreen": 102,
            "brightYellow": 103,
            "brightBlue": 104,
            "brightMagenta": 105,
            "brightCyan": 106,
            "brightWhite": 107,
        },
    };

    // https://en.m.wikipedia.org/wiki/ANSI_escape_code#Colors
    static log(strIn: string, color: string = "default", background: string = "default") {
        if (Logger.DEBUG === true) {
            // Get current local time and append to input string
            const today: Date = new Date();
            const ms: string = today.getMilliseconds().toString().padStart(3, "0");
            const time: string = today.toLocaleTimeString("en-us", { hour: "2-digit", minute: "2-digit" });
            const timeStr: string = time.substring(0, time.length - 3) + "." + ms + time.substring(time.length - 3);
            const dateStr: string = today.toLocaleDateString("en-CA");

            // Build string
            const dateTimeStrColorized: string = Logger.colorize(`[${dateStr} ${timeStr}]:`, "brightBlack");
            const strInColorized: string = Logger.colorize(strIn, color, background);
            const logStr: string = `${dateTimeStrColorized} ${strInColorized}`;
            console.log(logStr);
        }
    }

    static logWithoutTime(strIn: string, color: string = "red", background: string = "default") {
        const strColorized = Logger.colorize(strIn, color, background);
        console.log(strColorized);
    }

    static colorize(strIn: string, color: string = "default", background: string = "default") {
        const esc = "\x1b[";
        const resetAll = "0m";
        const fg = Logger.colors.foreground[color];
        const bg = Logger.colors.background[background];
        const logStr = `${esc}${fg};${bg}m${strIn}${esc}${resetAll}`;
        return logStr;
    }

    static red(str: string) {
        Logger.log(str, "red");
    }
}