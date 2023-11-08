/**
 * Set's an interval for the given delay but starts the interval
 * at the next full hour
 * @param cb
 * @param delay
 */
export function setIntervalFromFullHour<T>(
    cb: (...args: unknown[]) => void,
    delay: number
) {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1);
    nextHour.setMinutes(0);
    nextHour.setSeconds(0);
    nextHour.setMilliseconds(0);

    const a = () => {
        setInterval(cb, delay);
        cb();
    };
    setTimeout(a, nextHour.getTime() - new Date().getTime());
}
