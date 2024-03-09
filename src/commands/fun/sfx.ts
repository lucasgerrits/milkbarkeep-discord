import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../classes/Command";

export default new Command({
    name: "sfx",
    description: "Link a sound file from the CFB stash.",
    options: [
        {
            name: "name",
            description: "The name of the sound.",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async(args): Promise<void> => {
        await args.interaction.deferReply();

        const baseURL: string = "https://www.carefreebomb.com/sfx/";
        const inputSound: string = args.options.getString("name", true).toLowerCase();
        const url: string = baseURL + "/sounds/" + inputSound + ".mp3";

        const buffer: ArrayBuffer | null = await fetch(url).then((response) => {
            return (response.status === 200) ? response.arrayBuffer() : null;
        });

        if (buffer === null) {
            await args.interaction.editReply({
                content: "I'm sorry, but I can't locate a sound by that name: \n`" + inputSound + "`",
            });
        } else {
            const bytes: number = buffer.byteLength;
            const kilobytes: number = (bytes / 1024);
            const urlToEmbed: string = baseURL + "embed/index.php?sound=" + inputSound;
            const replyString: string = `Sound: [${inputSound}.mp3](${urlToEmbed}) Size: ${kilobytes.toFixed(2)} KB ([Full List](${baseURL}))`;
            await args.interaction.editReply({ content: replyString });
        }
    }
});