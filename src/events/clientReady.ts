import { Events } from "discord.js";
import { Event } from "../classes/Event";
import { Logger } from "../util/Logger";
import { client } from "..";

export default new Event(
    Events.ClientReady,
    () => {
        const asciiText = "" +
        "___  ________ _      _   ________  ___  ______ _   __ _____ ___________ \n" +
        "|  \\/  |_   _| |    | | / /| ___ \\/ _ \\ | ___ \\ | / /|  ___|  ___| ___ \\ \n" +
        "| .  . | | | | |    | |/ / | |_/ / /_\\ \\| |_/ / |/ / | |__ | |__ | |_/ / \n" +
        "| |\\/| | | | | |    |    \\ | ___ \\  _  ||    /|    \\ |  __||  __||  __/ \n" +
        "| |  | |_| |_| |____| |\\  \\| |_/ / | | || |\\ \\| |\\  \\| |___| |___| | \n" +
        "\\_|  |_/\\___/\\_____/\\_| \\_/\\____/\\_| |_/\\_| \\_\\_| \\_/\\____/\\____/\\_|";
        console.log(Logger.colorize(asciiText, "red"));

        const bar: string = "========================================================================";
        console.log(Logger.colorize(bar, "red"));

        client.registerCommands();

        const readyStr: string = `${client.user?.tag} logged in and ready to serve!`;
        Logger.log(readyStr, "red");

        // client.user.setActivity("gorpin", { type: ActivityType.Custom });

        // client.timer.initialize(client);
    }
);