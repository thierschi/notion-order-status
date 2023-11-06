export interface NotionSearchResult {
    object: string;
    id: string;
    title: [
        {
            type: string;
            plain_text: string;
        }
    ];
}
