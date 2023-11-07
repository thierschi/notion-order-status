import { Client } from 'https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts';
import consts from '../../consts.ts';

const notion = new Client({
    auth: consts.NOTION_API_SECRET,
});

export default notion;
