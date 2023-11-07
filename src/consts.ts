import 'https://deno.land/x/dotenv@v3.2.2/load.ts';
import z from 'https://deno.land/x/zod@v3.22.4/index.ts';
import logger from './util/logger.util.ts';

const constsValidator = z.object({
    NOTION_API_SECRET: z.string(),
    DATABASE_MARKER: z.string(),
    DM_ORDER_STATUS_API_URL: z.string(),
    CHECK_INTERVAL: z.number(),
});

const rawConsts = {
    NOTION_API_SECRET: Deno.env.get('NOTION_API_SECRET'),
    DATABASE_MARKER: Deno.env.get('DATABASE_ID'),
    DM_ORDER_STATUS_API_URL: Deno.env.get('DM_ORDER_STATUS_API_URL'),
    CHECK_INTERVAL: Number(Deno.env.get('CHECK_INTERVAL')),
};
let consts: z.infer<typeof constsValidator>;
try {
    consts = constsValidator.parse(rawConsts);
} catch (e) {
    logger.error(
        '💥 Critical. Failed to load consts from environment. Aborting.',
        e
    );
    throw e;
}

export default consts;
