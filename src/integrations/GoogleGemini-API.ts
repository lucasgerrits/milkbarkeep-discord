import { 
    Content, 
    EnhancedGenerateContentResponse, 
    GenerateContentRequest, 
    GenerateContentResult, 
    GenerativeModel, 
    GoogleGenerativeAI, 
    GoogleGenerativeAIFetchError, 
    GoogleGenerativeAIResponseError, 
    HarmBlockThreshold, 
    HarmCategory, 
    Part, 
    SafetySetting, 
    SingleRequestOptions } from "@google/generative-ai";
import { googleGemini as apiKey } from "../../data/apiKeys.json";
import { Message, MessageResolvable } from "discord.js";
import { Logger } from "../util/Logger";
import { Util } from "../util/Util";
import { client } from "..";

export class GoogleGeminiApi {
    public readonly modelName: string = "gemini-1.5-flash";

    private model: GenerativeModel;
    private key: string;

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

    private conversation: Array<Content>;
    private maxChars: number = 300;
    
    constructor() {
        // Initialize Gemini object
        this.key = apiKey;
        const genAI = new GoogleGenerativeAI(this.key);
        this.model = genAI.getGenerativeModel({ 
            model: this.modelName,
            safetySettings: this.safetySettings,
        });
        // Reset conversation and set Barkeep character
        this.conversation = [];
        const rpLore: string = require("../../data/rpLore.js");
        const rpLoreParsed: string = rpLore.replace(/\[maxCharacters\]/g, this.maxChars.toString());
        const param: Content = { role: "user", parts: [{ text: rpLoreParsed}] };
        this.conversation.push(param);
    }

    private async generateContent(request: GenerateContentRequest | string | Array<string | Part>, requestOptions?: SingleRequestOptions): Promise<GenerateContentResult | undefined> {
        try {
            return this.model.generateContent(request, requestOptions);
        } catch (error) {
            if (error instanceof GoogleGenerativeAIFetchError) {
                // Possible service overloaded or other fetch errors
                Logger.log(`${error.status}: ${error.statusText}`);
            } else if (error instanceof GoogleGenerativeAIResponseError) {
                // Safety, parsing, or other content errors
                Logger.log(error.message);
                return error.response;
            }
        }
    }

    private async checkContentSafety(contentToModerate: string): Promise<string | undefined> {
        const result: GenerateContentResult = await this.generateContent(contentToModerate) as GenerateContentResult;
        const response: EnhancedGenerateContentResponse = result.response;
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

    public async chat(message: string | Message): Promise<string> {
        const prompt: string = (message instanceof Message) ? message.content : message;

        // Check for content that violates any of the service's moderation harm categories
        const modStatement: string | undefined = await this.checkContentSafety(prompt);
        if (typeof modStatement === 'string') {
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
        const result: GenerateContentResult = await this.generateContent({
            contents: this.conversation,
        }) as GenerateContentResult;
        const response: EnhancedGenerateContentResponse = result.response;
        const responseText: string = response.text();
        const responseFormatted: string = Util.replaceDoubleSpaces(responseText);
        Logger.log(`[Gemini]: ${responseFormatted}`, "brightCyan");
        return responseFormatted;
    }
}