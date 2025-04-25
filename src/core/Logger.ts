import fs from "fs";
import path from "path";
import { TextChannel } from "discord.js";
import { Util } from "../util/Util";
import { client } from "..";
import { consoleOutput } from "../../data/config.json";
import { ANSIColor, ANSIColorMap } from "../types/AppTypes";

export class Logger {
    private logStream: fs.WriteStream;
    private logDir: string;
    private currentDate: string;

    private readonly barStr: string = "========================================================================";
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

    constructor() {
        this.logDir = path.resolve(__dirname, "../../logs");
        if (!fs.existsSync(this.logDir)) { fs.mkdirSync(this.logDir); }
        this.currentDate = new Date().toISOString().split('T')[0];
        this.logStream = this.createStream();
    }
    
    public ai(str: string): void { this.log(`[GAI] ${str}`, "brightCyan"); }
    public bot(str: string): void { this.log(`[BOT] ${str}`, "red"); }
    public dev(str: string): void { this.log(`[DEV] ${str}`, "default"); }
    public err(str: string): void { this.log(`[ERR] ${str}`, "default"); }
    public ra(str: string): void { this.log(`[RAC] ${str}`, "yellow"); }
    public sky(str: string): void { this.log(`[SKY] ${str}`, "brightBlue"); }
    public vc(str: string): void { this.log(`[VOC] ${str}`, "brightMagenta"); }
    
    public deb(debugVar: any): void {
        const wrapper = { debugVar };
        this.log(`[DEB] ${Object.keys(wrapper)[0]}:`, "default");
        console.log(debugVar);
    }

    public rotate(): void {
        this.logStream.end();
        this.currentDate = new Date().toISOString().split('T')[0];
        this.logStream = this.createStream();
    }

    private createStream(): fs.WriteStream {
        const logFile: string = path.join(this.logDir, `${this.currentDate}.log`);
        return fs.createWriteStream(logFile, { flags: "a" });
    }

    private getDateTimeStr(): string {
        const today: Date = new Date();
        const ms: string = today.getMilliseconds().toString().padStart(3, "0");
        const time: string = today.toLocaleTimeString("en-us", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const timeStr: string = time.substring(0, time.length - 3) + "." + ms + time.substring(time.length - 3);
        const dateStr: string = today.toLocaleDateString("en-CA"); // YYYY-MM-DD
        return `${dateStr} ${timeStr}`;
    }

    public bar(): void {
        this.logWithoutTime(this.barStr);
        this.logStream.write(`${this.barStr}\n`);
    }

    private colorize(strIn: string, color: ANSIColor = "default", background: ANSIColor = "default"): string {
        // https://en.m.wikipedia.org/wiki/ANSI_escape_code#Colors
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

    public log(strIn: string, color: ANSIColor = "default", background: ANSIColor = "default"): void {
        if (this.DEBUG === true) {
            const dateTimeStr: string = this.getDateTimeStr();
            this.logToDiscord(dateTimeStr, strIn);
            this.logToConsole(dateTimeStr, strIn, color, background);
            this.logToFile(dateTimeStr, strIn);
        }
    }

    private logToFile(dateTimeStr: string, strIn: string): void {
        const logStr: string = `[${dateTimeStr}] ${strIn}\n`;
        this.logStream.write(logStr);
    }

    private logToConsole(dateTimeStr: string, strIn: string, color: ANSIColor = "default", background: ANSIColor = "default"): void {
        const dateTimeStrColorized: string = this.colorize(`[${dateTimeStr}]:`, "brightBlack");
        const strInColorized: string = this.colorize(strIn, color, background);
        const logStr: string = `${dateTimeStrColorized} ${strInColorized}`;
        console.log(logStr);
    }

    private logToDiscord(dateTimeStr: string, strIn: string): void {
        if (consoleOutput.enabled === true) {
            try {
                const channel: TextChannel = client.channels.cache.get(consoleOutput.channelId) as TextChannel;
                const discLogStr: string = `\`\`\`\n[${dateTimeStr}]: ${Util.addBrailleBlank(strIn)}\n\`\`\``;
                channel.send({ content: discLogStr });
            } catch (error) {
                console.log(error);
            }
        }
    }
}