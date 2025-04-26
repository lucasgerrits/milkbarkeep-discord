import { Content, ContentListUnion, GenerateContentResponse, GoogleGenAI, HarmBlockThreshold, HarmCategory, Part, SafetySetting } from "@google/genai";
import { DMChannel, Message, MessageResolvable } from "discord.js";
import { Util } from "../util/Util";
import { googleGemini as apiKey } from "../../data/apiKeys.json";
import type { GenAIResponse } from "../types/GenAITypes";
import { client } from "..";

export class GoogleGenAIApi {
    public readonly modelName: string = "gemini-2.0-flash-exp";
    private ai: GoogleGenAI;
    private key: string;

    private conversation: Array<Content>;
    private maxChars: number = 300;

    private safetySettings: Array<SafetySetting> = [
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
        }, {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }, {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
        }, {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
        }
    ];

    constructor() {
        // Initialize GenAI
        this.key = apiKey;
        this.ai = new GoogleGenAI({
            apiKey: this.key
        });
        // Reset conversation and set Barkeep character
        this.conversation = [];
        const rpLore: string = require("../../data/rpLore.js");
        const rpLoreParsed: string = rpLore.replace(/\[maxCharacters\]/g, this.maxChars.toString());
        const param: Content = { role: "user", parts: [{ text: rpLoreParsed}] };
        this.conversation.push(param);
    }

    private async generateContent(contents: ContentListUnion | string | Array<string | Part>): Promise<GenerateContentResponse> {
        try {
            // maxOutputTokens: this.maxChars,
            return this.ai.models.generateContent({
                model: this.modelName,
                contents: contents,
                config: {
                    responseModalities: [
                        "Text",
                        "Image"
                    ]
                }
            });
        } catch (error: unknown) {
            client.logger.err(error as string);
            throw error;
        }
    }

    private async checkContentSafety(contentToModerate: string): Promise<string | undefined> {
        const response: GenerateContentResponse = await this.generateContent(contentToModerate);
        if (response.promptFeedback !== undefined && response.promptFeedback.blockReasonMessage !== undefined) {
            const modStatement: string = `
                Can you rephrase the following block reason message or write something similar in your own words (based on your previously stated character): ${response.promptFeedback.blockReasonMessage}
            `;
            return modStatement;
        } else {
            return undefined;
        }
    }

    private async checkDiscordMessageReference(message: Message): Promise<void> {
        // Recursively call until first message in reply chain
        if (message.reference !== null) {
            const referencedMessage: Message = await message.channel.messages.fetch(message.reference.messageId as MessageResolvable);
            await this.checkDiscordMessageReference(referencedMessage);
        }
        // Then add this message as the next in the message chain array
        const role: "model" | "user" = (message.author.displayName === client.user?.displayName) ? "model" : "user";
        const param = { role: role, parts: [{ text: message.content }] };
        this.conversation.push(param);
    }

    public async chat(message: Message): Promise<GenAIResponse> {
        const log = (str: string) => {
            client.logger.ai(`${!message.channel.isDMBased() ? `${message.guild?.name} ~ #${message.channel.name} -` : ""} ${message.member?.displayName}: ${str}`);
        }

        const prompt: string = (message instanceof Message) ? message.content : message;
        log(`Prompt - ${prompt}`);

        // Check for content that violates any of the service's moderation harm categories
        const modStatement: string | undefined = await this.checkContentSafety(prompt);
        if (typeof modStatement === "string") {
            const param: Content = { role: 'user', parts: [{ text: modStatement}] };
            this.conversation.push(param);
        } else {
            if (message instanceof Message) {
                await this.checkDiscordMessageReference(message);
            } else {
                const param: Content = { role: "user", parts: [{ text: prompt }] };
                this.conversation.push(param);
            }
        }

        // Generate result using bot lore and either mod statement or reply chain
        const response: GenerateContentResponse = await this.generateContent(this.conversation);
        
        // Format object to return for Discord messages
        const chatResponse: GenAIResponse = {};
        const responseText: string | undefined = response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (responseText) {
            const responseFormatted: string = Util.replaceDoubleSpaces(responseText);
            chatResponse.text = responseFormatted;
            log(`Response - ${responseFormatted}`);
        }
        const inlineData: string | undefined = response?.candidates?.[0]?.content?.parts?.[1]?.inlineData?.data;
        if (inlineData !== undefined) {
            chatResponse.imageBuffer = Buffer.from(inlineData, "base64");
            log(`Response - [Image Attached]`);
        }
        return chatResponse;
    }
}