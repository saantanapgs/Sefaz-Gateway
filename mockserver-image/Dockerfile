FROM mockserver/mockserver:mockserver-5.15.0

COPY initializerJson.json /config/initializerJson.json

ENV MOCKSERVER_INITIALIZATION_JSON_PATH=/config/initializerJson.json
ENV SERVER_PORT=1080