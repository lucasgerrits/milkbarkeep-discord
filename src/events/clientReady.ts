import { Events } from "discord.js";
import { Event } from "../core/Event";
import { Logger } from "../core/Logger";
import { client } from "..";

export default new Event(
    Events.ClientReady,
    async () => {
        const asciiText = "" +
        "___  ________ _      _   ________  ___  ______ _   __ _____ ___________ \n" +
        "|  \\/  |_   _| |    | | / /| ___ \\/ _ \\ | ___ \\ | / /|  ___|  ___| ___ \\ \n" +
        "| .  . | | | | |    | |/ / | |_/ / /_\\ \\| |_/ / |/ / | |__ | |__ | |_/ / \n" +
        "| |\\/| | | | | |    |    \\ | ___ \\  _  ||    /|    \\ |  __||  __||  __/ \n" +
        "| |  | |_| |_| |____| |\\  \\| |_/ / | | || |\\ \\| |\\  \\| |___| |___| | \n" +
        "\\_|  |_/\\___/\\_____/\\_| \\_/\\____/\\_| |_/\\_| \\_\\_| \\_/\\____/\\____/\\_|";
        console.log(Logger.colorize(asciiText, "red"));

        console.log(Logger.colorize(Logger.bar, "red"));

        if (client.shouldRegisterCommands) {
            client.registerCommands();
        }

        const readyStr: string = `${client.user?.tag} logged in and ready to serve!`;
        Logger.log(`[BOT] ${readyStr}`, "red");

        client.timers.initialize();

        await client.setMilkStatus();
    }
);