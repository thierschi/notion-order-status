import z from 'https://deno.land/x/zod@v3.22.4/index.ts';

const stateCodeValidator = z.union([
    z.literal('DELIVERED'),
    z.literal('PROCESSING'),
    z.literal('ERROR'),
    z.literal('SHIPPED'),
]);
export type StateCode = z.infer<typeof stateCodeValidator>;

export const orderStatusValidator = z.object({
    resultDateTime: z.string(),
    summaryStateCode: stateCodeValidator,
    summaryStateText: z.string(),
    summaryDate: z.string(),
    summaryPrice: z.number(),
    summaryPriceText: z.string(),
    currency: z.string().nullable(),
    language: z.string(),
    customerNo: z.string(),
    shopNo: z.string().nullable(),
    orderNo: z.string(),
    orderDate: z.string().nullable(),
    deliveryType: z.number(),
    deliveryText: z.string(),
    infoText: z.string().nullable(),
    subOrders: z.array(
        z.object({
            orderNo: z.string(),
            orderDate: z.string().nullable(),
            stateCode: stateCodeValidator,
            stateDate: z.string(),
            stateText: z.string(),
            price: z.number(),
            priceText: z.string(),
            infoText: z.string().nullable(),
            promisedMinDeliveryDate: z.string().nullable(),
            promisedMaxDeliveryDate: z.string().nullable(),
            trackingProviderId: z.any().nullable(),
            trackingProviderName: z.string().nullable(),
            trackingNumber: z.any().nullable(),
            trackingUrl: z.any().nullable(),
            positions: z.array(
                z.object({
                    articleNo: z.number(),
                    articleGroup: z.number(),
                    quantity: z.number(),
                    description: z.string(),
                })
            ),
        })
    ),
});
export type OrderStatus = z.infer<typeof orderStatusValidator>;
