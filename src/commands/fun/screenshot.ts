import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { Command } from "../../classes/Command";
import { Jimp } from "jimp";
const DiscordScreenshot = require("discord-screenshot");

export default new Command({
    name: "screenshot",
    description: "Create a pseudo screenshot of a given message.",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();
        try {
            const img = "./../assets/pfpStatic.png";
            const screen = new DiscordScreenshot();
            await screen.setPfp(img);
            await screen.setUsername('MrTomato');
            await screen.setTimestamp(new Date());
            await screen.setContent('Hello world!');
            const output = screen.construct();
            await output.write('./output.png');
            await args.interaction.editReply({
                files: [{
                    attachment: "./output.png",
                    name: "output.png"
                }]
            });
            
        } catch(err) {
            console.log(err);
            await args.interaction.editReply({ content: "Something went wrong with the command." });
        }
    }
});