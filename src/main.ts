import consts from './consts.ts';
import { runOrderCheck } from './service/orderCheck.service.ts';
import { setIntervalFromFullHour } from './util/interval.util.ts';
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
setIntervalFromFullHour(intervalFn, consts.CHECK_INTERVAL);
intervalFn();
