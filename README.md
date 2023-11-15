<p align="center">
  <img src="https://github.com/thierschi/notion-order-status/assets/53370847/4e7e323b-7d45-4dd8-8cd7-3f9b6a9f89b9" />
</p>


# dm Order Status to Notion Sync

> ⚠️ DISCLAMER: This project is an independent effort and is not affiliated with [dm](https://dm.de) or [dm Fotoparadies](https://fotoparadies.de). The integration is developed by me for personal use and is shared with the community for convenience. Any trademarks, logos, or brand names mentioned are the property of their respective owners. The project creators disclaim any association with or endorsement by dm or dm Fotoparadies.
> Use this integration at your own discretion, and be aware that it is not officially supported or endorsed. For any inquiries or concerns related to dm Fotoparadies' services, please refer to their official channels.

## Overview
This integration is a handy tool designed to streamline the tracking process for film development and photo orders at the gweman drug store dm, specifically tailored for Fotoparadies. This integration bridges the gap between the traditional paper-based order system and the digital convenience of Notion, providing users with a seamless and automated workflow to keep track of their orders.

## Key Features
1. **Automated Order Status Updates:**
   - The integration regularly checks the status of all specified orders at DM Fotoparadies.
   - It fetches the most up-to-date information and updates the corresponding Notion database entries.

2. **Real-time Notifications:**
   - Whenever there is a change in the status of an order, the integration automatically comments on the respective Notion entry.
   - The user who created the order entry will be mentioned. This way you receive push notifications for all significant updates.

3. **Effortless Tracking:**
   - Users can effortlessly monitor the progress of their film development or photo orders without manually checking the DM Fotoparadies website.
   - Notion serves as a centralized hub for order details, making it easy to access and manage information.

## Deployement

### Prerequisites
There are two ways of deploying this integration. You can either run it directly with **deno** or you can deploy it on docker. I will explain the docker method here.

### Get a notion API Key
This integration works as an **internal integration** in notion.

1. Go to [www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click on `Create new integration`
3. Choose the workspace the integration should work in, give it a name and optionally add an image for the integration.
4. Click on `show` to reveal the API token and copy it. The integration will need this to work.
5. Click on `capabilities` and make sure the following settings are set:
   <img width="498" alt="image" src="https://github.com/thierschi/notion-order-status/assets/53370847/085e8a74-a9c8-4eba-89e5-28e5d8b884c6">

### Deploy the integration with docker

1. Clone this repository
2. Open the `Dockerfile` and adjust the base image depending on your system.
   `FROM denoland/deno:1.37.2` for **amd64**
   `FROM lukechannings/deno:v1.37.2` for **arm64**
3. Create a `docker-compose.yaml`. You can use the provided template `docker-compose.template.yaml`. Just copy it and rename it to `docker-compose.yaml`: `cp ./docker-compose.template.yaml ./docker-compose.yaml`.
4. Inside the `docker-compose.yaml` edit the environment variables. The following environment variables are available / required:
   |                 |        |                                                   |
   |-----------------|--------|---------------------------------------------------|
   |NOTION_API_SECRET|REQUIRED|The Notion API token for your internal integration.|
   |DATABASE_MARKER  |optional|This is the string used to identify databases that should be processed by this integration. The default is `nost`.|
   |DM_ORDER_STATUS_API_URL|optional|The URL of the dm / Fotoparadies API. Default is `https://spot.photoprintit.com/spotapi/orderInfo/forShop`|
   |CHECK_INTERVAL|optional|The interval in **ms** in which the integration should check for new statuses. The default is 3,600,000 (1 hour). Note: The integration will check for updates once when it's first started and then in the given interval starting from the next full hour.|
5. Build the docker image by running the comand `docker build -t notion-order-status .`.
6. When the integration is built start it by running `docker-compose up`. Run `docker-compose up -d` to start the integration detached (recommended).

> 💡 Step 5 and 6 require sudo privileges.

> This `docker-compose.yaml` will create a volume for the logs. However you can also check the logs by running `docker logs <CONTAINER_ID>`. To find out the container id run `docker ps`.

### Create a database in notion and integrate it
Now that you have the integration up and running you need to create a database for traking your orders. When creating a database the following requirements must be met in order for the integration to work:

- The database must be marked with the database marker. To do this just add `[nost]`* to the name of the database.
- The database must contain the following two properties:
  - A number property for the store number. This property must be marked with `[nost-store-id]`*.
  - A number property for the order number. This property must be marked with `[nost-order-id]`*.
 
**To add this integration to a page** click on the three dots `...` in top right hand corner of your page. Under `Connections` hover over `+ Add Connections` and select your internal integration that you created earlier.
 
That's it. All status properties will be (re-)created by the integration when they're not present or in a wrong format. Feel free to rename these properties to whatever you want, just remember to leave the database marker in the name.

> \* In case you have set the `DATABASE_MARKER` environment variable, replace `nost` with your own marker name.
  
## Screenshots
<img width="1123" alt="image" src="https://github.com/thierschi/notion-order-status/assets/53370847/ca343596-cff5-4b16-9bee-179d196227a5">
<img width="1236" alt="image" src="https://github.com/thierschi/notion-order-status/assets/53370847/1dd684d3-acc7-44d9-b0ed-0477b368e16f">
<img width="433" alt="image" src="https://github.com/thierschi/notion-order-status/assets/53370847/26e717fa-e112-4bb1-b658-df15d1c9647f">

## Contributing
   - Contributions are welcome! Feel free to submit bug reports, feature requests, or even pull requests to enhance the functionality of the integration.

## License
   - This project is licensed under the [MIT License](https://github.com/thierschi/notion-order-status/blob/c783cd905b735fd219d8693adac9a464f0dd7195/LICENSE).
