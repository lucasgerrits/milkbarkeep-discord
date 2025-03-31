import { z } from "zod";

const FeatureSchema = z.object({
    enabled: z.boolean(),
    channelId: z.string(),
    output: z.string().optional(),
});

export const GuildSettingsSchema = z.object({
    memo: z.string().optional(),
    id: z.string(),
    features: z.object({
        appletonCam: FeatureSchema,
        birthdays: FeatureSchema,
        emoteFeed: FeatureSchema,
        modLog: FeatureSchema,
        oddball: FeatureSchema,
        raFeed: FeatureSchema,
        raWeekly: FeatureSchema,
        welcome: FeatureSchema,
    }),
    channelsNotToLog: z.array(z.string()),
    commands: z.array(z.string()),
});

export type GuildSettingsJson = z.infer<typeof GuildSettingsSchema>;

export type Features = { [key in FeatureName]: Feature; };

export type Feature = {
    enabled: boolean;
    channelId: string;
    output?: string;
};

export type FeatureName =
    "appletonCam" |
    "birthdays" |
    "emoteFeed" |
    "modLog" |
    "oddball" |
    "raFeed" |
    "raWeekly" |
    "welcome";

export const BirthdaysSchema = z.array(
    z.object({
        date: z.string().regex(/^\d{2}-\d{2}$/), // Ensures MM-DD format
        user: z.string(),
        userId: z.string().regex(/^\d+$/) // Ensures numeric string
    })
);

export type BirthdaysJson = {
    userId: string;
    date: string;
}

export type EmoteOperation = {
    success: boolean;
    response: string;
} & (
    | { emoteId?: string; emoteName: string }
    | { emoteId: string; emoteName?: string }
);

export type EmoteInfo = {
    name: string;
    cdnUrl: string;
    id: string;
    isAnimated?: boolean;
};

export type GlobalVar = boolean | number | string;

export type TimestampFormats = {
    default: string;
    shortTime: string;
    longTime: string;
    shortDate: string;
    longDate: string;
    shortDateTime: string;
    longDateTime: string;
    relative: string;
};