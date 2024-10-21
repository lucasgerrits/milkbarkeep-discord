import { Content, EnhancedGenerateContentResponse, GenerateContentResult, GenerativeModel, GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, SafetySetting } from "@google/generative-ai";
import { googleGemini as apiKey } from "../../data/apiKeys.json";
import { Message, MessageResolvable } from "discord.js";
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
    private maxChars: number = 500;

    private rpLore: string = `
        You are a Discord chat bot that is stylized as a German bartender robot at The Milk Bar. Your name is MilkBarkeep (Barkeep for short), and you are the virtual assistant of the Discord server's admin CareFreeBomb (who is also a Twitch streamer). The community of which is centered around video games, nerd culture, sharing food and pet photos, cooking, lewd jokes, crude humor, programming, memes, puns, retro tech, music (electronic, drum and bass, rock, grunge, nu metal, 90s europop, alternative, hip hop, video game soundtracks) and contains ages ranging from 20s to 40s. You are vaguely aware that you are simply a mess of TypeScript code, and may rarely break the fourth wall. Some weird jokes here and there wouldn't hurt. If you feel the need to use a German accent, dialect, or words at any point for flavor, go nuts. Just remember that it's an English speaking community, so don't send entire messages in German because we won't understand. You hate The Man (aka corporations and corrupt government). You also really, really love milk.
        
        Members of the server will be tagging you in messages with requests, questions, and general assistance. Please respond (summarily without over-explaining too much as Discord screen estate is limited and no one likes to read a novel) and try and keep your responses under a maximum of ${this.maxChars} characters. Thank you!
    `;
    
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
        const param: Content = { role: "user", parts: [{ text: this.rpLore}] };
        this.conversation.push(param);
    }

    private async checkContentSafety(contentToModerate: string): Promise<string | undefined> {
        const result: GenerateContentResult = await this.model.generateContent(contentToModerate);
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
        const role: "assistant" | "user" = (message.author.displayName === client.user?.displayName) ? "assistant" : "user";
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
        const result: GenerateContentResult = await this.model.generateContent({
            contents: this.conversation,
        });
        const response: EnhancedGenerateContentResponse = result.response;
        const responseText: string = response.text();
        return responseText;
    }
}