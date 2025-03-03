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