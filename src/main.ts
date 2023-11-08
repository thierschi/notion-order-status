import consts from './consts.ts';
import { runOrderCheck } from './service/orderCheck.service.ts';
import './util/logger.util.ts';
import logger, { logWelcomeMessage } from './util/logger.util.ts';

logWelcomeMessage();

async function intervalFn() {
    try {
        await runOrderCheck();
    } catch (e) {
        logger.error('❌ Error while running order check!', e);
    }
}
setInterval(intervalFn, consts.CHECK_INTERVAL);
intervalFn();
