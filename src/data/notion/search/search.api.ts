import { DatabaseObjectResponse } from 'https://deno.land/x/notion_sdk@v2.2.3/src/api-endpoints.ts';
import markers from '../../../util/marker.util.ts';
import notion from '../client.ts';
import Database from '../database/database.api.ts';

export async function getDatabases() {
    const searchResponse = (
        await notion.search({
            filter: {
                value: 'database',
                property: 'object',
            },
        })
    ).results;

    const databases = searchResponse.filter(
        ({ object }) => object === 'database'
    ) as DatabaseObjectResponse[];
    const markedDatabases = databases.filter(({ title }) => {
        const plain_texts = title.map(({ plain_text }) => plain_text);

        for (const text of plain_texts) {
            if (markers.isMarkedName(text)) return true;
        }
        return false;
    });

    return markedDatabases.map((database) => new Database(database));
}
