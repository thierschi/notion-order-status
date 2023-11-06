import {
    DatabaseObjectResponse,
    DatabasePropertyConfigResponse,
    PageObjectResponse,
    PartialDatabaseObjectResponse,
    RichTextItemRequest,
} from 'https://deno.land/x/notion_sdk@v2.2.3/src/api-endpoints.ts';
import consts from './consts.ts';
import { getDatabases } from './service/notion/index.ts';
import { Client } from 'https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts';
import 'https://deno.land/x/lodash@4.17.19/lodash.js';
const _ = (self as any)._;

interface DMStatus {
    resultDateTime: string;
    summaryStateCode: string;
    summaryStateText: string;
    summaryPrice: number;
    orderDate: string;
    deliveryType: number;
    deliveryText: string;
    subOrders: {
        orderNo: string | null;
        orderDate: string | null;
        stateCode: 'DELIVERED' | 'PROCESSING' | 'ERROR' | 'SHIPPED';
        stateDate: string;
        stateText: string;
        price: number;
        positions: {
            articleNo: number;
            articleGroup: number;
            quantity: number;
            description: string;
        }[];
    }[];
}

// Initializing a client
const notion = new Client({
    auth: consts.NOTION_API_SECRET,
});
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
const relevantDatabases = databases.filter(({ title }) => {
    const plain_texts = title.map(({ plain_text }) => plain_text);

    for (const text of plain_texts) {
        const marker: string[] = text.match(/(?<=\[)[\s\S]*?(?=\])/) ?? [];
        if (marker.includes(consts.DATABASE_MARKER)) return true;
    }
    return false;
});
const ensuredDatabases: DatabaseObjectResponse[] = [];
for (const db of relevantDatabases) {
    try {
        ensuredDatabases.push(await ensureColumns(db));
    } catch (e) {
        console.error(e);
    }
}
for (const db of ensuredDatabases) {
    processDatabase(db);
}

async function processDatabase(database: DatabaseObjectResponse) {
    const items = (
        await notion.databases.query({
            database_id: database.id,
        })
    ).results as PageObjectResponse[];

    for (const item of items) {
        const storeIdColumn = getPageColumn(item, 'store-id');
        const orderIdColumn = getPageColumn(item, 'order-id');

        if (
            storeIdColumn === undefined ||
            storeIdColumn.type !== 'number' ||
            orderIdColumn === undefined ||
            orderIdColumn.type !== 'number'
        ) {
            continue;
        }
        if (storeIdColumn.number === null) {
            updateInfo(item, 'store-id was empty.');
            continue;
        }
        if (orderIdColumn.number === null) {
            updateInfo(item, 'order-id was empty.');
            continue;
        }

        const storeId = storeIdColumn.number;
        const orderId = orderIdColumn.number;

        // console.log(storeId, orderId);
        const dmStatusResponse = await fetch(
            `https://spot.photoprintit.com/spotapi/orderInfo/forShop?config=1320&shop=${storeId}&order=${orderId}`
        );
        const dmStatus: DMStatus = await dmStatusResponse.json();

        // @ts-expect-error abc
        if (item.properties.Name.title[0].text.content === 'Beispiel') {
            // console.log(item);
        }
        if (dmStatus.subOrders.length > 1) {
            updateInfo(
                item,
                'DM returned more than one suborder... Using first.'
            );
        }
        if (dmStatus.subOrders.length === 0) {
            updateInfo(item, 'DM returned no suborder... Aborting.');
            continue;
        }

        const [orderStatus] = dmStatus.subOrders;

        //console.log(dmStatus);

        const propKeys = Object.keys(database.properties);
        const keys = {
            info:
                propKeys.find(
                    (key) =>
                        key.indexOf(`[${consts.DATABASE_MARKER}-a-info]`) > -1
                ) ?? '',
            lastRefresh:
                propKeys.find(
                    (key) =>
                        key.indexOf(
                            `[${consts.DATABASE_MARKER}-a-last-refresh]`
                        ) > -1
                ) ?? '',
            orderDate:
                propKeys.find(
                    (key) =>
                        key.indexOf(
                            `[${consts.DATABASE_MARKER}-a-order-date]`
                        ) > -1
                ) ?? '',
            positions:
                propKeys.find(
                    (key) =>
                        key.indexOf(`[${consts.DATABASE_MARKER}-a-positions]`) >
                        -1
                ) ?? '',
            price:
                propKeys.find(
                    (key) =>
                        key.indexOf(`[${consts.DATABASE_MARKER}-a-price]`) > -1
                ) ?? '',
            status:
                propKeys.find(
                    (key) =>
                        key.indexOf(`[${consts.DATABASE_MARKER}-a-status]`) > -1
                ) ?? '',
            statusInfo:
                propKeys.find(
                    (key) =>
                        key.indexOf(
                            `[${consts.DATABASE_MARKER}-a-status-info]`
                        ) > -1
                ) ?? '',
        };
        const newPage: any = _.cloneDeep(item);

        newPage.properties[keys.info] = {
            id: newPage.properties[keys.info].id,
            rich_text: [],
        };
        newPage.properties[keys.lastRefresh] = {
            id: newPage.properties[keys.lastRefresh].id,
            date: {
                start: new Date().toISOString(),
                end: null,
                time_zone: null,
            },
        };
        newPage.properties[keys.orderDate] = {
            id: newPage.properties[keys.orderDate].id,
            date: {
                start: orderStatus.orderDate,
                end: null,
                time_zone: null,
            },
        };
        newPage.properties[keys.positions] = {
            id: newPage.properties[keys.positions].id,
            rich_text: [
                {
                    text: {
                        content: orderStatus.positions
                            .map(
                                (val) =>
                                    `${val.quantity}x ${val.description} (${val.articleGroup}-${val.articleNo})`
                            )
                            .join('\n'),
                    },
                },
            ],
        };
        newPage.properties[keys.price] = {
            id: newPage.properties[keys.price].id,
            number: orderStatus.price / 100,
        };
        newPage.properties[keys.statusInfo] = {
            id: newPage.properties[keys.statusInfo].id,
            rich_text: [
                {
                    text: {
                        content: orderStatus.stateText,
                    },
                },
            ],
        };
        newPage.properties[keys.status] = {
            id: database.properties[keys.status].id,
            multi_select: [
                (() => {
                    let notionStatus = 'Unknown';
                    switch (orderStatus.stateCode) {
                        case 'DELIVERED':
                            notionStatus = 'Ready';
                            break;
                        case 'PROCESSING':
                            notionStatus = 'Processing';
                            break;
                        case 'SHIPPED':
                            notionStatus = 'Shipped';
                            break;
                    }

                    console.log(orderStatus.stateCode, notionStatus);

                    const option = database.properties[
                        keys.status
                        // @ts-expect-error notion is notion
                    ].multi_select.options.find(
                        // @ts-expect-error notion is notion
                        (option) => option.name === notionStatus
                    ).id;

                    console.log(
                        notionStatus,
                        option
                        // database.properties[keys.status].multi_select.options
                    );

                    return { id: option };
                })(),
            ],
        };
        console.log(newPage.properties[keys.status].multi_select);

        await notion.pages.update({
            page_id: item.id,
            properties: newPage.properties,
        });
    }
}

async function updateInfo(page: PageObjectResponse, info: string) {
    const propKeys = Object.keys(page.properties);
    const key = propKeys.find(
        (key) => key.indexOf(`[${consts.DATABASE_MARKER}-a-info]`) > -1
    );
    const newPage: typeof page = _.cloneDeep(page);

    if (key === undefined || newPage.properties[key].type !== 'rich_text') {
        return;
    }

    // @ts-expect-error I hate notion
    newPage.properties[key].rich_text = [
        {
            text: {
                content: info,
            },
        },
    ];

    await notion.pages.update({
        page_id: page.id,
        properties: newPage.properties,
    });
}

async function ensureColumns(
    database: DatabaseObjectResponse
): Promise<DatabaseObjectResponse> {
    const storeIdColumn = getDBColumn(database, 'store-id');
    const orderIdColumn = getDBColumn(database, 'order-id');

    if (storeIdColumn === undefined || orderIdColumn === undefined) {
        throw new Error();
    }
    if (storeIdColumn.type !== 'number' || orderIdColumn.type !== 'number') {
        throw new Error();
    }

    const autoColumns: (Partial<DatabasePropertyConfigResponse> & {
        markerName: string;
        name: string;
    })[] = [
        {
            markerName: 'a-last-refresh',
            name: `*Last refresh [${consts.DATABASE_MARKER}-a-last-refresh]`,
            type: 'date',
            date: {},
        },
        {
            markerName: 'a-order-date',
            name: `*Order date [${consts.DATABASE_MARKER}-a-order-date]`,
            type: 'date',
            date: {},
        },
        {
            markerName: 'a-positions',
            name: `*Positions [${consts.DATABASE_MARKER}-a-positions]`,
            type: 'rich_text',
            rich_text: {},
        },
        {
            markerName: 'a-price',
            name: `*Price [${consts.DATABASE_MARKER}-a-price]`,
            type: 'number',
            number: { format: 'euro' },
        },
        {
            markerName: 'a-status-info',
            name: `*Status info [${consts.DATABASE_MARKER}-a-status-info]`,
            type: 'rich_text',
            rich_text: {},
        },
        {
            markerName: 'a-status',
            name: `*Status [${consts.DATABASE_MARKER}-a-status]`,
            type: 'multi_select',
            multi_select: {
                options: [
                    // @ts-expect-error ID is unkown before creation
                    {
                        name: 'Ready',
                        color: 'green',
                    },
                    // @ts-expect-error ID is unkown before creation
                    {
                        name: 'Shipped',
                        color: 'blue',
                    },
                    // @ts-expect-error ID is unkown before creation
                    {
                        name: 'Processing',
                        color: 'yellow',
                    },
                    // @ts-expect-error ID is unkown before creation
                    {
                        name: 'Unknown',
                        color: 'red',
                    },
                ],
            },
        },
        {
            markerName: 'a-info',
            name: `*Info [${consts.DATABASE_MARKER}-a-info]`,
            type: 'rich_text',
            rich_text: {},
        },
    ];

    const columnsToCreate: typeof autoColumns = [];
    for (const autoColumn of autoColumns) {
        const column = getDBColumn(database, autoColumn.markerName);

        if (column === undefined || column.type !== autoColumn.type) {
            columnsToCreate.push(autoColumn);
            continue;
        }
    }

    console.log(columnsToCreate);

    for (const columnToCreate of columnsToCreate) {
        const column = getDBColumn(database, columnToCreate.markerName);

        if (column !== undefined) {
            const newName = `${column.name.replaceAll(
                /\s*\[[\s\S]*\]\s*/g,
                ''
            )} [invalid-column]`;

            const properties: Record<string, DatabasePropertyConfigResponse> =
                {};
            properties[column.name] = {
                ...column,
                name: newName,
            };
            await notion.databases.update({
                database_id: database.id,
                properties: properties,
            });
        }

        const newColumn: Record<string, DatabaseObjectResponse> = {};
        newColumn[columnToCreate.name] = columnToCreate as any;
        delete (newColumn[columnToCreate.name] as any).markerName;
        await notion.databases.update({
            database_id: database.id,
            properties: newColumn as any,
        });
    }

    return (await notion.databases.retrieve({
        database_id: database.id,
    })) as DatabaseObjectResponse;
}

function getPageColumn(page: PageObjectResponse, markerName: string) {
    const properties = page.properties;
    const propertyKeys = Object.keys(properties);

    for (const key of propertyKeys) {
        const name = key.replaceAll(/([\s\S]*\[|\][\s\S]*)/g, '');

        if (name === `${consts.DATABASE_MARKER}-${markerName}`) {
            return properties[key];
        }
    }

    return undefined;
}

function getDBColumn(database: DatabaseObjectResponse, markerName: string) {
    const properties = database.properties;
    const propertyKeys = Object.keys(properties);

    for (const key of propertyKeys) {
        const name = key.replaceAll(/([\s\S]*\[|\][\s\S]*)/g, '');

        if (name === `${consts.DATABASE_MARKER}-${markerName}`) {
            return properties[key];
        }
    }

    return undefined;
}
