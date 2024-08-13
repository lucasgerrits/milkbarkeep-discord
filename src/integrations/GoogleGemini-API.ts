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
        }, {
            category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
        }
    ];

    constructor() {
        this.key = apiKey;
        const genAI = new GoogleGenerativeAI(this.key);
        this.model = genAI.getGenerativeModel({ model: this.modelName, safetySettings: this.safetySettings });
    }

    public async chat(message: string | Message): Promise<string> {
        const prompt: string = (message instanceof Message) ? message.content : message;

        const result: GenerateContentResult = await this.model.generateContent(prompt);
        const response: EnhancedGenerateContentResponse = result.response;
        const responseText: string = response.text();
        return responseText;
    }
}