import { PageObjectResponse } from 'https://deno.land/x/notion_sdk@v2.2.3/src/api-endpoints.ts';
import { StateCode } from '../../dm/dm.model.ts';
import notion from '../client.ts';
import Database from '../database/database.api.ts';

class Page {
    private db: Database;
    private page: PageObjectResponse;

    private propChanges: any = {};
    private hadSignificantChange = false;

    public constructor(page: PageObjectResponse, db: Database) {
        this.db = db;
        this.page = page;
    }

    public get orderId() {
        const dbProp = this.db.props.orderId;
        const prop = this.page.properties[dbProp.key];

        if (prop.type !== dbProp.propertyData.type) {
            throw new Error(
                `Expected ${dbProp.markerName} to be of type ${dbProp.propertyData.type} but was ${prop.type}!`
            );
        }

        return prop.number;
    }
    public get storeId() {
        const dbProp = this.db.props.storeId;
        const prop = this.page.properties[dbProp.key];

        if (prop.type !== dbProp.propertyData.type) {
            throw new Error(
                `Expected ${dbProp.markerName} to be of type ${dbProp.propertyData.type} but was ${prop.type}!`
            );
        }

        return prop.number;
    }
    public get createdByUserId() {
        const dbProp = this.db.props.createdBy;
        const prop = this.page.properties[dbProp.key];

        if (prop.type !== dbProp.propertyData.type) {
            throw new Error(
                `Expected ${dbProp.markerName} to be of type ${dbProp.propertyData.type} but was ${prop.type}!`
            );
        }

        return prop.created_by.id;
    }

    public set info(s: string) {
        this.propChanges[this.db.props.info.key] = {
            id: this.db.props.info.propertyData.id,
            rich_text: [
                {
                    text: {
                        content: s,
                    },
                },
            ],
        };
    }
    public get positions() {
        const dbProp = this.db.props.positions;
        const prop = this.page.properties[dbProp.key];

        if (prop.type !== dbProp.propertyData.type) {
            throw new Error(
                `Expected ${dbProp.markerName} to be of type ${dbProp.propertyData.type} but was ${prop.type}!`
            );
        }

        return prop.rich_text[0].plain_text;
    }
    public set positions(s: string) {
        if (s !== this.positions) this.hadSignificantChange = true;
        this.propChanges[this.db.props.positions.key] = {
            id: this.db.props.positions.propertyData.id,
            rich_text: [
                {
                    text: {
                        content: s,
                    },
                },
            ],
        };
    }
    public get statusInfo() {
        const dbProp = this.db.props.statusInfo;
        const prop = this.page.properties[dbProp.key];

        if (prop.type !== dbProp.propertyData.type) {
            throw new Error(
                `Expected ${dbProp.markerName} to be of type ${dbProp.propertyData.type} but was ${prop.type}!`
            );
        }

        return prop.rich_text[0].plain_text;
    }
    public set statusInfo(s: string) {
        if (s !== this.statusInfo) this.hadSignificantChange = true;
        this.propChanges[this.db.props.statusInfo.key] = {
            id: this.db.props.statusInfo.propertyData.id,
            rich_text: [
                {
                    text: {
                        content: s,
                    },
                },
            ],
        };
    }
    public set store(s: string) {
        this.propChanges[this.db.props.store.key] = {
            id: this.db.props.store.propertyData.id,
            rich_text: [
                {
                    text: {
                        content: s,
                    },
                },
            ],
        };
    }

    public set lastRefresh(date: string | null) {
        this.propChanges[this.db.props.lastRefresh.key] = {
            id: this.db.props.lastRefresh.propertyData.id,
            date:
                date === null
                    ? null
                    : {
                          start: date,
                          end: null,
                          time_zone: null,
                      },
        };
    }
    public set statusDate(date: string | null) {
        this.propChanges[this.db.props.statusDate.key] = {
            id: this.db.props.statusDate.propertyData.id,
            date:
                date === null
                    ? null
                    : {
                          start: date,
                          end: null,
                          time_zone: null,
                      },
        };
    }
    public set orderDate(date: string | null) {
        this.propChanges[this.db.props.orderDate.key] = {
            id: this.db.props.orderDate.propertyData.id,
            date:
                date === null
                    ? null
                    : {
                          start: date,
                          end: null,
                          time_zone: null,
                      },
        };
    }

    public get price() {
        const dbProp = this.db.props.price;
        const prop = this.page.properties[dbProp.key];

        if (prop.type !== dbProp.propertyData.type) {
            throw new Error(
                `Expected ${dbProp.markerName} to be of type ${dbProp.propertyData.type} but was ${prop.type}!`
            );
        }

        return prop.number;
    }
    public set price(n: number | null) {
        if (n !== this.price) this.hadSignificantChange = true;
        this.propChanges[this.db.props.price.key] = {
            id: this.db.props.price.propertyData.id,
            number: n,
        };
    }

    public get status() {
        const dbProp = this.db.props.status;
        const prop = this.page.properties[dbProp.key];

        if (prop.type !== dbProp.propertyData.type) {
            throw new Error(
                `Expected ${dbProp.markerName} to be of type ${dbProp.propertyData.type} but was ${prop.type}!`
            );
        }

        switch (prop.multi_select[0].name) {
            case 'Ready':
                return 'DELIVERED';
            case 'Shipped':
                return 'SHIPPED';
            case 'Processing':
                return 'PROCESSING';
        }
        return 'ERROR';
    }
    public set status(stateCode: StateCode) {
        if (stateCode !== this.status) this.hadSignificantChange = true;

        let statusName = 'Unknown';
        switch (stateCode) {
            case 'DELIVERED':
                statusName = 'Ready';
                break;
            case 'PROCESSING':
                statusName = 'Processing';
                break;
            case 'SHIPPED':
                statusName = 'Shipped';
                break;
        }

        const select =
            this.db.props.status.propertyData.multi_select.options.find(
                ({ name }) => name === statusName
            )!;

        this.propChanges[this.db.props.status.key] = {
            id: this.db.props.status.propertyData.id,
            multi_select: [{ id: select.id }],
        };
    }

    public setError() {
        const select =
            this.db.props.status.propertyData.multi_select.options.find(
                ({ name }) => name === 'Error'
            )!;
        this.propChanges[this.db.props.status.key] = {
            id: this.db.props.status.propertyData.id,
            multi_select: [{ id: select.id }],
        };
    }
    public clearAll() {
        this.propChanges[this.db.props.lastRefresh.key] = {
            id: this.db.props.lastRefresh.propertyData.id,
            date: null,
        };
        this.propChanges[this.db.props.statusDate.key] = {
            id: this.db.props.statusDate.propertyData.id,
            date: null,
        };
        this.propChanges[this.db.props.orderDate.key] = {
            id: this.db.props.orderDate.propertyData.id,
            date: null,
        };
        this.propChanges[this.db.props.positions.key] = {
            id: this.db.props.positions.propertyData.id,
            rich_text: [],
        };
        this.propChanges[this.db.props.statusInfo.key] = {
            id: this.db.props.statusInfo.propertyData.id,
            rich_text: [],
        };
        this.propChanges[this.db.props.info.key] = {
            id: this.db.props.info.propertyData.id,
            rich_text: [],
        };
        this.propChanges[this.db.props.store.key] = {
            id: this.db.props.store.propertyData.id,
            rich_text: [],
        };
        this.propChanges[this.db.props.price.key] = {
            id: this.db.props.price.propertyData.id,
            number: null,
        };
        this.propChanges[this.db.props.status.key] = {
            id: this.db.props.status.propertyData.id,
            multi_select: [],
        };
    }

    public async addNotificationComment(userId: string, s: string) {
        await notion.comments.create({
            parent: {
                page_id: this.page.id,
            },
            rich_text: [
                {
                    mention: {
                        user: {
                            id: userId,
                        },
                    },
                },
                {
                    text: {
                        content: ` ${s}`,
                    },
                    annotations: {
                        bold: true,
                        color: 'blue',
                    },
                },
            ],
        });
    }

    public async saveChanges() {
        await notion.pages.update({
            page_id: this.page.id,
            properties: this.propChanges,
        });

        if (this.hadSignificantChange) {
            await this.addNotificationComment(
                this.createdByUserId,
                'This order had a significant update.'
            );
        }

        this.propChanges = {};
        this.hadSignificantChange = false;
    }
}
export default Page;
