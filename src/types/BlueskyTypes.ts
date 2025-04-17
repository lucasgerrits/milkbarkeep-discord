export interface AuthorInfo {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
}

export interface ParentPostInfo {
    author: AuthorInfo;
    text: string;
    uri: string;
}