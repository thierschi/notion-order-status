import consts from '../../consts.ts';
import logger from '../../util/logger.util.ts';
import { sleep } from '../../util/sleep.util.ts';
import { orderStatusValidator } from './dm.model.ts';

export async function fetchOrderStatus(
    storeId: number | null,
    orderId: number
) {
    let url: string;
    if (!storeId) {
        url = `${consts.DM_ORDER_STATUS_API_URL_ORDER}?config=1320&fullOrderId=${orderId}`;
    } else {
        url = `${consts.DM_ORDER_STATUS_API_URL_FOR_SHOP}?config=1320&shop=${storeId}&order=${orderId}`;
    }

    let dmResponse: Response;

    for (let i = 0; (dmResponse = await fetch(url)).status === 429; i++) {
        logger.warn('⏱️ DM API is rate limiting. Waiting 10s before retrying.');
        if (i > 10) {
            throw new Error(
                'DM API is still rate limiting after 10 retries. Aborting.'
            );
        }
        await sleep(10 * 1000);
    }

    const dmOrderStatus = await dmResponse.json();

    return await orderStatusValidator.parseAsync(dmOrderStatus);
}
