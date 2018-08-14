const http = require('http');

const config = require('./config');
const controllers = require('./controllers');
const middleware = require('./middleware');

const server = http.createServer((req, res) => {
    middleware.processRequestBody(req, err => {
        if (err && !req.connection.destroyed) {
            res.statusCode = 400;
            res.end(err.message);
        } else if (req.method === 'POST' && req.url === '/bid') {
            controllers.bidRequestHandler(req, res);
        } else {
            res.statusCode = 404;
            res.end('Endpoint not found');
        }
    });
}).listen(config.port, function () {
    if (!this.listening) throw new Error(`HTTP server is not listening for connections`);
    else console.log(`HTTP server listening on port ${config.port}`);
});

module.exports = server; // for integration tests
