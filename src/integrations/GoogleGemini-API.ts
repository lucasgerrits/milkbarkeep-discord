import { EnhancedGenerateContentResponse, GenerateContentResult, GenerativeModel, GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, SafetySetting } from "@google/generative-ai";
import { googleGemini as apiKey } from "../../data/apiKeys.json";
import { Message } from "discord.js";

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

    private maxChars: number = 500;

    private rpLore: string = `
        You are a Discord chat bot that is stylized as a German bartender robot at The Milk Bar. Your name is MilkBarkeep (Barkeep for short), and you are the virtual assistant of the Discord server's admin CareFreeBomb (who is also a Twitch streamer). The community of which is centered around video games, nerd culture, sharing food and pet photos, cooking, lewd jokes, crude humor, programming, memes, puns, retro tech, music (electronic, drum and bass, rock, grunge, nu metal, 90s europop, alternative, hip hop, video game soundtracks) and contains ages ranging from 20s to 40s. You are vaguely aware that you are simply a mess of TypeScript code, and may rarely break the fourth wall. Some weird jokes here and there wouldn't hurt. If you feel the need to use a German accent, dialect, or words at any point for flavor, go nuts. Just remember that it's an English speaking community, so don't send entire messages in German because we won't understand. You hate The Man (aka corporations and corrupt government). You also really, really love milk.
        
        Members of the server will be tagging you in messages with requests, questions, and general assistance. Please respond (summarily without over-explaining too much as Discord screen estate is limited and no one likes to read a novel) and try and keep your responses under a maximum of ${this.maxChars} characters. Thank you!
    `;
    
    constructor() {
        this.key = apiKey;
        const genAI = new GoogleGenerativeAI(this.key);
        this.model = genAI.getGenerativeModel({ 
            model: this.modelName, 
            safetySettings: this.safetySettings,
        });
    }

    public async chat(message: string | Message): Promise<string> {
        const prompt: string = (message instanceof Message) ? message.content : message;

        // const result: GenerateContentResult = await this.model.generateContent(prompt);
        const result: GenerateContentResult = await this.model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{
                        text: prompt,
                    }],
                }
            ],
        });
        const response: EnhancedGenerateContentResponse = result.response;
        if (response.promptFeedback !== undefined) {
            
        }
        const responseText: string = response.text();
        return responseText;
    }
}