export type GuildSettingsJson = {
    id: string;
    memo?: string;
    features: Features;
    channelsNotToLog: string[];
    commands: string[];
}

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
    "testing" |
    "welcome";

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
}