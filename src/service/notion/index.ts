import consts from '../../consts.ts';
import { nFetch } from './fetch.service.ts';
import { NotionSearchResult } from './types.ts';

export async function getDatabases() {
    const searchBody = {
        filter: {
            value: 'database',
            property: 'object',
        },
    };
    const searchRawRes = await nFetch('/search', {
        body: JSON.stringify(searchBody),
        method: 'POST',
    });
    const searchResults = (await searchRawRes.json())
        .results as NotionSearchResult[];

    console.log(searchResults);

    const validDatabases = searchResults.filter((res) => {
        const isDatabaseObject = res.object === 'database';
        let hasDatabaseMarker = false;

        for (const title of res.title) {
            const marker: string[] =
                title.plain_text.match(/(?<=\[)[\s\S]*?(?=\])/) ?? [];
            if (marker.indexOf(consts.DATABASE_MARKER) > -1) {
                hasDatabaseMarker = true;
            }
        }

        return isDatabaseObject && hasDatabaseMarker;
    });

    return validDatabases;
}
