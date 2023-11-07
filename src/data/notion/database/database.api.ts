import {
    CreatedByDatabasePropertyConfigResponse,
    DatabaseObjectResponse,
    DateDatabasePropertyConfigResponse,
    MultiSelectDatabasePropertyConfigResponse,
    NumberDatabasePropertyConfigResponse,
    PageObjectResponse,
    RichTextDatabasePropertyConfigResponse,
} from 'https://deno.land/x/notion_sdk@v2.2.3/src/api-endpoints.ts';
import logger from '../../../util/logger.util.ts';
import markers from '../../../util/marker.util.ts';
import notion from '../client.ts';
import Page from '../page/page.api.ts';
import { KNOWN_PROPERTIES_CONFIG, KnownProperties } from './database.model.ts';

class Database {
    private iDb: DatabaseObjectResponse;
    private knownProperties: KnownProperties | undefined = undefined;

    public constructor(db: DatabaseObjectResponse) {
        this.iDb = db;
    }

    public get db() {
        return this.iDb;
    }
    public get props() {
        if (this.knownProperties === undefined) {
            throw new Error('Ensure properties before getting them.');
        }
        return this.knownProperties;
    }

    public async getNonReadyPages() {
        const pages = (
            await notion.databases.query({
                database_id: this.db.id,
                filter: {
                    property: this.props.status.key,
                    multi_select: {
                        does_not_contain: 'Ready',
                    },
                },
            })
        ).results as PageObjectResponse[];
        return pages.map((page) => new Page(page, this));
    }

    public getDbPropByMarker(markerName: string) {
        const properties = this.iDb.properties;
        const propertyKeys = Object.keys(properties);

        for (const key of propertyKeys) {
            const name = markers.getName(key);

            if (name === markerName) {
                return properties[key];
            }
        }

        return undefined;
    }

    public async ensureProperties() {
        logger.info(
            `Ensuring database ${this.db.title[0].plain_text} (${this.db.id})`
        );

        for (const [_, prop] of Object.entries(KNOWN_PROPERTIES_CONFIG.check)) {
            const dbProp = this.getDbPropByMarker(prop.markerName);

            if (
                dbProp === undefined ||
                dbProp.type !== prop.propertyData.type
            ) {
                throw new Error(
                    `Expected properties were not present in database ${this.db.title[0].plain_text} (${this.db.id})`
                );
            }
        }

        const newOrUpdatedProps: any = {};
        for (const [_, value] of Object.entries(
            KNOWN_PROPERTIES_CONFIG.ensureOrCreate
        )) {
            const prop = this.getDbPropByMarker(value.markerName);

            const propName = prop?.name ?? undefined;
            const propId = prop?.id ?? undefined;

            if (
                propName !== undefined &&
                propId !== undefined &&
                prop?.type !== value.propertyData.type
            ) {
                const newPropName = markers.invalidate(propName);

                const updatedProp: any = {};
                updatedProp[propName] = {
                    ...prop,
                    name: newPropName,
                };
                await notion.databases.update({
                    database_id: this.iDb.id,
                    properties: updatedProp,
                });

                logger.info(
                    `👀 Found and renamed invalid property ${propName} (${propId}) to ${newPropName}.`
                );
            }

            if (propName !== undefined && propId !== undefined) {
                newOrUpdatedProps[propName] = {
                    ...value.propertyData,
                    name: propName,
                    id: propId,
                };

                continue;
            }

            logger.info(
                `🆕 Queued new property ${value.propertyData.name} for creation.`
            );
            newOrUpdatedProps[value.propertyData.name!] = value.propertyData;
        }
        await notion.databases.update({
            database_id: this.iDb.id,
            properties: newOrUpdatedProps,
        });
        this.iDb = (await notion.databases.retrieve({
            database_id: this.db.id,
        })) as DatabaseObjectResponse;

        this.knownProperties = {
            storeId: {
                markerName: KNOWN_PROPERTIES_CONFIG.check.storeId.markerName,
                key: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.check.storeId.markerName
                )!.name,
                propertyData: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.check.storeId.markerName
                )! as NumberDatabasePropertyConfigResponse,
            },
            orderId: {
                markerName: KNOWN_PROPERTIES_CONFIG.check.orderId.markerName,
                key: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.check.orderId.markerName
                )!.name,
                propertyData: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.check.orderId.markerName
                )! as NumberDatabasePropertyConfigResponse,
            },
            createdBy: {
                markerName: KNOWN_PROPERTIES_CONFIG.check.createdBy.markerName,
                key: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.check.createdBy.markerName
                )!.name,
                propertyData: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.check.createdBy.markerName
                )! as CreatedByDatabasePropertyConfigResponse,
            },
            lastRefresh: {
                markerName:
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.lastRefresh
                        .markerName,
                key: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.lastRefresh
                        .markerName
                )!.name,
                propertyData: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.lastRefresh
                        .markerName
                )! as DateDatabasePropertyConfigResponse,
            },
            statusDate: {
                markerName:
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.statusDate
                        .markerName,
                key: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.statusDate.markerName
                )!.name,
                propertyData: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.statusDate.markerName
                )! as DateDatabasePropertyConfigResponse,
            },
            orderDate: {
                markerName:
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.orderDate.markerName,
                key: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.orderDate.markerName
                )!.name,
                propertyData: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.orderDate.markerName
                )! as DateDatabasePropertyConfigResponse,
            },
            positions: {
                markerName:
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.positions.markerName,
                key: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.positions.markerName
                )!.name,
                propertyData: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.positions.markerName
                )! as RichTextDatabasePropertyConfigResponse,
            },
            statusInfo: {
                markerName:
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.statusInfo
                        .markerName,
                key: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.statusInfo.markerName
                )!.name,
                propertyData: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.statusInfo.markerName
                )! as RichTextDatabasePropertyConfigResponse,
            },
            info: {
                markerName:
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.info.markerName,
                key: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.info.markerName
                )!.name,
                propertyData: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.info.markerName
                )! as RichTextDatabasePropertyConfigResponse,
            },
            store: {
                markerName:
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.store.markerName,
                key: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.store.markerName
                )!.name,
                propertyData: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.store.markerName
                )! as RichTextDatabasePropertyConfigResponse,
            },
            price: {
                markerName:
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.price.markerName,
                key: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.price.markerName
                )!.name,
                propertyData: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.price.markerName
                )! as NumberDatabasePropertyConfigResponse,
            },
            status: {
                markerName:
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.status.markerName,
                key: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.status.markerName
                )!.name,
                propertyData: this.getDbPropByMarker(
                    KNOWN_PROPERTIES_CONFIG.ensureOrCreate.status.markerName
                )! as MultiSelectDatabasePropertyConfigResponse,
            },
        };

        logger.info(
            `✅ Ensured database ${this.db.title[0].plain_text} (${this.db.id}) sucessfully.`
        );
    }
}
export default Database;
