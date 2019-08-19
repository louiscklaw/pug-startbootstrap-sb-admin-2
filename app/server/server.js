// server.js

const path = require( 'path' );

PROJ_HOME = path.join( __dirname, '..', '..' )
DOCS_DIR = path.join( PROJ_HOME, 'docs' )
HTTP_PORT = 8081


var express = require( 'express' )
const app = express()

app.use( express.static( DOCS_DIR ) )

app.listen( HTTP_PORT, function () {
    console.log( `server running on ${HTTP_PORT}` );
} )
