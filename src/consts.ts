import 'https://deno.land/x/dotenv@v3.2.2/load.ts';
import z from 'https://deno.land/x/zod@v3.22.4/index.ts';

const constsValidator = z.object({
    NOTION_API_SECRET: z.string(),
    DATABASE_MARKER: z.string(),
});

const rawConsts = {
    NOTION_API_SECRET: Deno.env.get('NOTION_API_SECRET'),
    DATABASE_MARKER: Deno.env.get('DATABASE_ID'),
};
const consts = constsValidator.parse(rawConsts);

export default consts;
