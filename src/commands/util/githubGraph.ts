import { ApplicationCommandOptionType, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { Command } from "../../core/Command";
import { Logger } from "../../util/Logger";
import puppeteer, { Browser, ElementHandle, HTTPResponse, Page } from "puppeteer";

export default new Command({
    name: "github-graph",
    description: "Creates a calendar graph of commits in the last year by the given GitHub user.",
    options: [
        {
            name: "user",
            description: "The user to lookup",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (args): Promise<void> => {
        await args.interaction.deferReply();

        // Get inputs
        const gitUser: string = args.options.getString("user", true);
        const url: string = `https://github.com/${gitUser}`;
        
        // Launch puppeteer
        const browser: Browser = await puppeteer.launch({ headless: true });
        const page: Page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        let imageBase64Str: string = "";
        let contributions: string = "";
        try {
            // Check if page exists
            const response: HTTPResponse | null = await page.goto(url, { waitUntil: "domcontentloaded" });
            if (response && response.status() === 404) {
                throw(`GitHub profile \"${gitUser}\" not found.`);
            }

            // Take screenshot of calendar graph
            const graphSelector: string = '.js-calendar-graph';
            const calendarGraph: ElementHandle<Element> | null = await page.waitForSelector(graphSelector, { timeout: 5000 }).catch(() => null);
            if (calendarGraph) {
                imageBase64Str = await calendarGraph.screenshot({ encoding: "base64" });
            } else {
                throw("Calendar graph not found.");
            }

            // Get contribution count
            const contributionsTextRegex = /(\d+)\s+contributions?\s+in\s+the\s+last\s+year/;
            const contributionsText = await page.evaluate(() => {
                return document.body.innerText;
            });
            const match = contributionsText.match(contributionsTextRegex);
            contributions = (match && match[0]) ? match[0] : "";

            await browser.close();
        } catch (error: any) {
            await browser.close();
            Logger.log(error);
            await args.interaction.editReply({ content: error });
            return;
        }

        // Create embed
        const buffer: Buffer = Buffer.from(imageBase64Str, "base64");
        const attachment = new AttachmentBuilder(buffer, { name: "github-graph.png" });
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor("#000000")
            .setDescription(`${contributions} from [${gitUser}](<${url}>)`)
            .setImage(`attachment://github-graph.png`);

        // Send message
        try {
            await args.interaction.editReply({
                embeds: [ embed ],
                files: [ attachment ]
            });
        } catch (error: any) {
            Logger.log(error);
            await args.interaction.editReply({ content: "Something went wrong with sending the message." });
        }
    }
});