import moment from 'https://deno.land/x/momentjs@2.29.1-deno/mod.ts';
import { fetchOrderStatus } from '../data/dm/dm.api.ts';
import Database from '../data/notion/database/database.api.ts';
import { getDatabases } from '../data/notion/search/search.api.ts';
import logger from '../util/logger.util.ts';

export async function runOrderCheck() {
    logger.info('>>> Starting check');
    logger.info('Getting databases');
    const unensuredDatabases = await getDatabases();

    logger.info('Ensuring databases');
    const databases: Database[] = [];
    for (const db of unensuredDatabases) {
        try {
            await db.ensureProperties();
            databases.push(db);
        } catch (e) {
            logger.error('❌ Error while ensuring database!', e);
        }
    }

    for (const db of databases) {
        await runCheckForDatabase(db);
    }

    logger.info('<<< Finished check');
}

async function runCheckForDatabase(db: Database) {
    logger.info(
        `Performing order check for databse ${db.db.title[0].plain_text} (${db.db.id})`
    );

    const pages = await db.getNonReadyPages();

    for (const page of pages) {
        page.clearAll();

        page.lastRefresh = moment().toISOString(true);

        const storeId = page.storeId;
        const orderId = page.orderId;

        if (storeId === null) {
            page.info = 'Missing Store ID.';
            page.setError();
            page.saveChanges();
            continue;
        }
        if (orderId === null) {
            page.info = 'Missing Order ID.';
            page.setError();
            page.saveChanges();
            continue;
        }

        const orderStatus = await fetchOrderStatus(storeId, orderId);

        page.statusDate = orderStatus.summaryDate;
        page.status = orderStatus.summaryStateCode;
        page.statusInfo = orderStatus.summaryStateText;

        if (orderStatus.summaryStateCode === 'ERROR') {
            page.saveChanges();
            continue;
        }

        page.orderDate = orderStatus.orderDate;
        if (orderStatus.subOrders.length > 0) {
            const positions = [];

            for (let i = 0; i < orderStatus.subOrders.length; i++) {
                if (orderStatus.subOrders[i].positions.length === 0) continue;

                positions.push(
                    `Suborder ${i}:\n${orderStatus.subOrders[i].positions
                        .map(
                            (val) =>
                                `${val.quantity}x ${val.description} (${val.articleGroup}-${val.articleNo})`
                        )
                        .join('\n')}`
                );
            }

            const positionsString = positions.join('\n-----------\n');

            page.positions = positionsString;
        }
        page.store = orderStatus.deliveryText;
        page.price = orderStatus.summaryPrice / 100;

        page.saveChanges();
    }

    logger.info(`✅ Checked ${pages.length} pages without errors.`);
}
