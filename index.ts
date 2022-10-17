import fastify from 'fastify'

const server = fastify()

server.get('/ping', async (request, reply) => {
    return 'pong\n'
})

// for liveliness probe
server.get('/', async (request, reply) => {
    return 'ok'
})

server.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
