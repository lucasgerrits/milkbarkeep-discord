import { TextChannel } from "discord.js";
import { Util } from "../util/Util";
import { client } from "..";
import { consoleOutput } from "../../data/config.json";
import { ANSIColor, ANSIColorMap } from "../types/AppTypes";

export class Logger {
    public static readonly bar: string = "========================================================================";
    private readonly DEBUG: boolean = true;
    private readonly colors: ANSIColorMap = {
        "default": [39, 49], 
        "black": [30, 40],
        "red": [31, 41],
        "green": [32, 42],
        "yellow": [33, 43],
        "blue": [34, 44],
        "magenta": [35, 45],
        "cyan": [36, 46],
        "white": [37, 47],
        "brightBlack": [90, 100],
        "brightRed": [91, 101],
        "brightGreen": [92, 102],
        "brightYellow": [93, 103],
        "brightBlue": [94, 104],
        "brightMagenta": [95, 105],
        "brightCyan": [96, 106],
        "brightWhite": [97, 107]
    };
    
    public ai(str: string): void { this.log(`[AI] ${str}`, "brightCyan"); }
    public bday(str: string): void { this.log(`[BDAY] ${str}`, "brightGreen"); }
    public bot(str: string): void { this.log(`[BOT] ${str}`, "red"); }
    public cmd(str: string): void { this.log(`[CMD] ${str}`, "red"); }
    public dev(str: string): void { this.log(`[DEV] ${str}`, "default"); }
    public ra(str: string): void { this.log(`[RA] ${str}`, "yellow"); }
    public vc(str: string): void { this.log(`[VC] ${str}`, "brightMagenta"); }

    private getDateTimeStr(): string {
        const today: Date = new Date();
        const ms: string = today.getMilliseconds().toString().padStart(3, "0");
        const time: string = today.toLocaleTimeString("en-us", { hour: "2-digit", minute: "2-digit" });
        const timeStr: string = time.substring(0, time.length - 3) + "." + ms + time.substring(time.length - 3);
        const dateStr: string = today.toLocaleDateString("en-CA");
        return `${dateStr} ${timeStr}`;
    }

    public colorize(strIn: string, color: ANSIColor = "default", background: ANSIColor = "default"): string {
        const esc: string = "\x1b[";
        const resetAll: string = "0m";
        const fg: number = this.colors[color][0];
        const bg: number = this.colors[background][1];
        const logStr: string = `${esc}${fg};${bg}m${strIn}${esc}${resetAll}`;
        return logStr;
    }

    public logWithoutTime(strIn: string, color: ANSIColor = "red", background: ANSIColor = "default"): void {
        const strColorized: string = this.colorize(strIn, color, background);
        console.log(strColorized);
    }

    // https://en.m.wikipedia.org/wiki/ANSI_escape_code#Colors
    public log(strIn: string, color: ANSIColor = "default", background: ANSIColor = "default"): void {
        if (this.DEBUG === true) {
            // Get current local time
            const dateTimeStr: string = this.getDateTimeStr();

            // Output to Discord
            if (consoleOutput.enabled === true) {
                try {
                    const channel: TextChannel = client.channels.cache.get(consoleOutput.channelId) as TextChannel;
                    const discLogStr: string = `\`\`\`\n[${dateTimeStr}]: ${Util.addBrailleBlank(strIn)}\n\`\`\``;
                    channel.send({ content: discLogStr });
                } catch (error) {
                    console.log(error);
                }
            }
            
            // Build string and output to console
            const dateTimeStrColorized: string = this.colorize(`[${dateTimeStr}]:`, "brightBlack");
            const strInColorized: string = this.colorize(strIn, color, background);
            const logStr: string = `${dateTimeStrColorized} ${strInColorized}`;
            console.log(logStr);
        }
    }
}