import consts from '../../consts.ts';

export function nFetch(input: string, options?: RequestInit | undefined) {
    const opts = options ?? {};

    return fetch(`https://api.notion.com/v1${input}`, {
        ...opts,
        headers: {
            ...opts.headers,
            Authorization: consts.NOTION_API_SECRET,
            'Notion-Version': '2022-06-28',
        },
    });
}
