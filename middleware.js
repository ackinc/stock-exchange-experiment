// makes the body of the request available at req.body
function processRequestBody(req, cb) {
    if (req.method === 'GET' || req.headers["content-type"] !== 'application/json') {
        req.body = {};
        cb();
    } else {
        const body = [];
        req.on('data', chunk => {
            body.push(chunk);
            if (body.length > 1e6) {
                req.connection.destroy();
                cb(new Error(`Too much data in request body`));
            }
        });
        req.on('error', err => cb(err));
        req.on('end', () => {
            let err;
            try {
                req.body = JSON.parse(body.join(''));
            } catch (e) {
                err = new Error(`Request body is not valid JSON`);
            }
            cb(err);
        });
    }
}

module.exports = {
    processRequestBody
}
