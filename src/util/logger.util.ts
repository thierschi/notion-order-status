import Logger from 'https://deno.land/x/logger@v1.1.1/logger.ts';

const logger = new Logger();

await logger.initFileLogger('./logs', {
    rotate: true,
});

export default logger;

export function logWelcomeMessage() {
    logger.info('🎞️ Order status integration started.');
    logger.info(
        'This massively overengineered solution to a minor problem was brought to you by Lukas Thiersch.'
    );
    logger.info('++++++++++++++++++++++++++++++++++++');
}
