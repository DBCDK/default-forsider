import fastify from 'fastify'

const fastifyCORS = require("@fastify/cors");

const server = fastify()

server.get('/ping', async (request, reply) => {
    return 'pong\n'
})

// cors settings
const corsOptions = {
    origin: "*",
    methods: "GET,PUT,POST,DELETE,OPTIONS,HEAD",
};

server.register(fastifyCORS, corsOptions);

// for liveliness probe
server.get('/', async (request, reply) => {
    return 'ok'
})

server.listen({ port: 3000, host: '0.0.0.0'}, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
