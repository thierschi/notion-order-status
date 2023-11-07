import {
    CreatedByDatabasePropertyConfigResponse,
    DatabasePropertyConfigResponse,
    DateDatabasePropertyConfigResponse,
    MultiSelectDatabasePropertyConfigResponse,
    NumberDatabasePropertyConfigResponse,
    RichTextDatabasePropertyConfigResponse,
} from 'https://deno.land/x/notion_sdk@v2.2.3/src/api-endpoints.ts';
import markers from '../../../util/marker.util.ts';

interface ManagedPropertyConfig {
    markerName: string;
    propertyData:
        | Partial<DateDatabasePropertyConfigResponse>
        | Partial<RichTextDatabasePropertyConfigResponse>
        | Partial<NumberDatabasePropertyConfigResponse>
        | Partial<CreatedByDatabasePropertyConfigResponse>
        | Partial<{
              name: string;
              type: 'multi_select';
              multi_select: {
                  options: {
                      name: string;
                  }[];
              };
          }>;
}

interface ManagedProperty<T> {
    markerName: string;
    key: string;
    propertyData: T;
}

export interface KnownProperties {
    storeId: ManagedProperty<NumberDatabasePropertyConfigResponse>;
    orderId: ManagedProperty<NumberDatabasePropertyConfigResponse>;
    createdBy: ManagedProperty<CreatedByDatabasePropertyConfigResponse>;

    lastRefresh: ManagedProperty<DateDatabasePropertyConfigResponse>;
    statusDate: ManagedProperty<DateDatabasePropertyConfigResponse>;
    orderDate: ManagedProperty<DatabasePropertyConfigResponse>;

    positions: ManagedProperty<RichTextDatabasePropertyConfigResponse>;
    statusInfo: ManagedProperty<RichTextDatabasePropertyConfigResponse>;
    info: ManagedProperty<RichTextDatabasePropertyConfigResponse>;
    store: ManagedProperty<RichTextDatabasePropertyConfigResponse>;

    price: ManagedProperty<NumberDatabasePropertyConfigResponse>;

    status: ManagedProperty<MultiSelectDatabasePropertyConfigResponse>;
}
interface KnownPropertiesConfig {
    check: {
        storeId: ManagedPropertyConfig;
        orderId: ManagedPropertyConfig;
        createdBy: ManagedPropertyConfig;
    };
    ensureOrCreate: {
        lastRefresh: ManagedPropertyConfig;
        statusDate: ManagedPropertyConfig;
        orderDate: ManagedPropertyConfig;

        positions: ManagedPropertyConfig;
        statusInfo: ManagedPropertyConfig;
        info: ManagedPropertyConfig;
        store: ManagedPropertyConfig;

        price: ManagedPropertyConfig;

        status: ManagedPropertyConfig;
    };
}

export const KNOWN_PROPERTIES_CONFIG: KnownPropertiesConfig = {
    check: {
        storeId: {
            markerName: 'store-id',
            propertyData: {
                type: 'number',
            },
        },
        orderId: {
            markerName: 'order-id',
            propertyData: {
                type: 'number',
            },
        },
        createdBy: {
            markerName: 'created-by',
            propertyData: {
                type: 'created_by',
            },
        },
    },
    ensureOrCreate: {
        lastRefresh: {
            markerName: 'a-last-refresh',
            propertyData: {
                name: `*Last refresh [${markers.toMarkerName(
                    'a-last-refresh'
                )}]`,
                type: 'date',
                date: {},
            },
        },
        orderDate: {
            markerName: 'a-order-date',
            propertyData: {
                name: `*Order date [${markers.toMarkerName('a-order-date')}]`,
                type: 'date',
                date: {},
            },
        },
        statusDate: {
            markerName: 'a-status-date',
            propertyData: {
                name: `*Status date [${markers.toMarkerName('a-status-date')}]`,
                type: 'date',
                date: {},
            },
        },
        positions: {
            markerName: 'a-positions',
            propertyData: {
                name: `*Positions [${markers.toMarkerName('a-positions')}]`,
                type: 'rich_text',
                rich_text: {},
            },
        },
        price: {
            markerName: 'a-price',
            propertyData: {
                name: `*Price [${markers.toMarkerName('a-price')}]`,
                type: 'number',
                number: { format: 'euro' },
            },
        },
        statusInfo: {
            markerName: 'a-status-info',
            propertyData: {
                name: `*Status info [${markers.toMarkerName('a-status-info')}]`,
                type: 'rich_text',
                rich_text: {},
            },
        },
        store: {
            markerName: 'a-store',
            propertyData: {
                name: `*Store [${markers.toMarkerName('a-store')}]`,
                type: 'rich_text',
                rich_text: {},
            },
        },
        info: {
            markerName: 'a-info',
            propertyData: {
                name: `*Info [${markers.toMarkerName('a-info')}]`,
                type: 'rich_text',
                rich_text: {},
            },
        },
        status: {
            markerName: 'a-status',
            propertyData: {
                name: `*Status [${markers.toMarkerName('a-status')}]`,
                type: 'multi_select',
                multi_select: {
                    options: [
                        {
                            name: 'Ready',
                        },
                        {
                            name: 'Shipped',
                        },
                        {
                            name: 'Processing',
                        },
                        {
                            name: 'Unknown',
                        },
                        {
                            name: 'Error',
                        },
                    ],
                },
            },
        },
    },
};
