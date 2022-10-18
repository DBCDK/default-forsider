import fastify from 'fastify'

const fastifyCORS = require("@fastify/cors");

const server = fastify()

server.get('/ping', async (request, reply) => {
    return 'pong\n'
})

// for liveliness probe
server.get('/', async (request, reply) => {
    return 'ok'
})

// for yo 
server.get('/hello', async (request, reply) => {
    return 'Yo pjo'
})

server.listen({ port: 3000, host: '0.0.0.0'}, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
