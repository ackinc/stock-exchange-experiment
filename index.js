const http = require('http');

const config = require('./config');
const controllers = require('./controllers');
const middleware = require('./middleware');

const server = http.createServer((req, res) => {
    res.json = sendJSONResponse;

    middleware.processRequestBody(req, err => {
        if (req.connection.destroyed) {
            // connection was destroyed because too much data was being sent in request body
            // do nothing
        } else if (err) {
            console.error(err);
            res.json({ success: false, message: err.message }, 400);
        } else if (req.method === 'POST' && req.url === '/bid') {
            controllers.bidRequestHandler(req, res);
        } else {
            res.statusCode = 404;
            res.end();
        }
    });
}).listen(config.port, function () {
    if (!this.listening) throw new Error(`HTTP server is not listening for connections`);
    else console.log(`HTTP server listening on port ${config.port}`);
});

function sendJSONResponse(body, status = 200) {
    this.statusCode = status;
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(body));
}

module.exports = server; // for integration tests
