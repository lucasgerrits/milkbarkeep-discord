import { Collection, CommandInteractionOptionResolver, Events, Interaction } from "discord.js";
import { Event } from "../classes/Event";
import { Logger } from "../util/Logger";
import { client } from "..";
import type { ExtendedInteraction } from "../types/CommandTypes";

export default new Event(
    Events.InteractionCreate,
    async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        console.log(command);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        let logStr: string = "";
        if (interaction.commandName === "anon") {
            logStr = "/anon ran.";
        } else {
            logStr = `${interaction.user.tag} ran /${interaction.commandName} in #${interaction.channel}.`;
        }
        Logger.log(logStr, "white");

        try {
            await command.run({
                options: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction
            });
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    }
);