import fastify from 'fastify'
import {generate, svg2Image} from "./svg/svgGenerator";

const server = fastify()

// interface for requst parameters
/**
 * Define interface for title, materialType parameters
 */
interface IDefaultQuerystring {
    title: string;
    materialType: string;
}

interface IHeaders {
    'h-Custom': string;
}

// Typed endpoint - defaultcover
server.get<{
    Querystring: IDefaultQuerystring,
    Headers: IHeaders
}>('/defaultcover', async (request, reply) => {
    const {title, materialType} = request.query
    const customerHeader = request.headers['h-Custom']
    // do something with request data
    return generate(title, materialType)
})


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

server.listen({port: 3000, host: '0.0.0.0'}, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
