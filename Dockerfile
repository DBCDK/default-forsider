ARG NODE_BASEIMAGE=docker-dbc.artifacts.dbccloud.dk/dbc-node:latest

# ---- Base Node ----
FROM  $NODE_BASEIMAGE AS build
RUN apt-get update && apt-get install fontconfig -y

# set working directory
WORKDIR /home/node/app

USER node
# copy project file
COPY --chown=node:node . .

# install node packages
RUN npm set progress=false && npm config set depth 0 && \
    npm install && npm run build

# ---- Release ----
FROM $NODE_BASEIMAGE AS release
RUN apt-get update && apt-get install fontconfig -y
WORKDIR /home/node/app
COPY --chown=node:node --from=build /home/node/app/ ./

USER node
CMD ["npm", "start"]
