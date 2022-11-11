import fastify from 'fastify'
import {generate, generateArray} from "./svg/svgGenerator";
import path from "path";
import {materialTypes, sizes} from "./utils";
import {IFormats} from "./utils";

const _ = require("lodash")
const server = fastify()

// public folder for (static) images
server.register(require('@fastify/static'), {
    root: path.join(__dirname, 'images'),
})

interface IRequestStatus {
    status: boolean,
    message: string
}


// only validates materialtype for now -- TODO more validation
function checkRequest(query:ICovers): IRequestStatus {
    const {title, materialType} = query
    const requestStatus = {status: true, message: "all good"};

    // all params in query must be set
    if ( !title || !materialType ){
        return {status:false, message:"ALL parameters ( title, materialType) must be set in query"}
    }

    // check materialtype
    const ucType = _.upperFirst(materialType);
    let found = Object.keys(materialTypes).indexOf(ucType);
    requestStatus.status = found !== -1;
    if(!requestStatus.status){
        requestStatus.message = "not supported materialType:" + materialType
        return requestStatus
    }
    return requestStatus;
}


/**
 * Define interface for title, materialType parameters
 */
export interface ICovers {
    title: string
    materialType:materialTypes
}

interface IHeaders {
    'h-Custom': string;
}


// Typed endpoint - defaultcover
server.get<{
    Querystring: ICovers,
    Headers: IHeaders
}>('/defaultcover', {
    preValidation: (request, reply, done) => {
        const requestStatus = checkRequest(request.query)
        done(!requestStatus.status ? new Error(requestStatus.message) : undefined)
    }
}, async (request, reply) => {
    const customerHeader = request.headers['h-Custom']
    return generate(request.query)
})

export interface ICoversArray{
    coverParams:Array<ICovers>
}
// typed endpoint - POST
server.post<{
    Headers: IHeaders;
    Body: ICoversArray;
}>('/defaultcover/',  (request, reply) => {
    const fisk = generateArray(request.body);
    reply.code(200).send({ response: fisk });
});


// ping/pong
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
