# notion-order-status

Notion Integration which fetches status from DM's API and updates notion databases

# Environment

The following environment variables can / msut be specified

-   `NOTION_API_SECRET` (REQUIRED): The secret for your Notion **Internal** Integration
-   `DATABSE_MARKER` (optional - defaults to `nost`): A string that identifies databases which should be processed

> Database markers must be present in database name inside [ ].

-   `DM_ORDER_STATUS_API_URL` (optional - defaults to [spot.photoprintit.com/[...]](https://spot.photoprintit.com/spotapi/orderInfo/forShop)): the URL of the dm API.
-   `CHECK_INTERVAL` (optional - defaults to 1 hour): The interval in which to check for oder status updates in ms.
