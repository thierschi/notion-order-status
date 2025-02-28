import 'https://deno.land/x/dotenv@v3.2.2/load.ts';
import z from 'https://deno.land/x/zod@v3.22.4/index.ts';
import logger from './util/logger.util.ts';

const DEFAULT_DATABASE_MARKER = 'nost';
const DEFAULT_DM_ORDER_STATUS_API_FOR_SHOP =
    'https://spot.photoprintit.com/spotapi/orderInfo/forShop';
const DEFAULT_DM_ORDER_STATUS_API_ORDER =
    'https://spot.photoprintit.com/spotapi/orderInfo/order';
const DEFAULT_CHECK_INTERVAL = 60 * 60 * 1000;

const constsValidator = z.object({
    NOTION_API_SECRET: z.string(),
    DATABASE_MARKER: z.string(),
    DM_ORDER_STATUS_API_URL_FOR_SHOP: z.string(),
    DM_ORDER_STATUS_API_URL_ORDER: z.string(),
    CHECK_INTERVAL: z.number(),
});

const rawConsts = {
    NOTION_API_SECRET: Deno.env.get('NOTION_API_SECRET'),
    DATABASE_MARKER: Deno.env.get('DATABASE_MARKER') ?? DEFAULT_DATABASE_MARKER,
    DM_ORDER_STATUS_API_URL_FOR_SHOP:
        Deno.env.get('DM_ORDER_STATUS_API_URL_FOR_SHOP') ??
        DEFAULT_DM_ORDER_STATUS_API_FOR_SHOP,
    DM_ORDER_STATUS_API_URL_ORDER:
        Deno.env.get('DM_ORDER_STATUS_API_URL_ORDER') ??
        DEFAULT_DM_ORDER_STATUS_API_ORDER,
    CHECK_INTERVAL: Number(
        Deno.env.get('CHECK_INTERVAL') ?? DEFAULT_CHECK_INTERVAL
    ),
};
let consts: z.infer<typeof constsValidator>;
try {
    consts = constsValidator.parse(rawConsts);
} catch (e) {
    logger.error(
        '💥 Critical. Failed to validate consts from environment. Aborting.',
        e
    );
    throw e;
}

export default consts;
