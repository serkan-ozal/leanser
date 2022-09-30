const http = require('http');

const httpAgent = new http.Agent({
    keepAlive: true,
});

function _doRequest(options, body, resolve, reject) {
    let request = http.request(options, (response) => {
        let data = '';
        response.on('end', () => {
            resolve({
                data,
                status: response.statusCode,
                headers: response.headers,
            });
        });
        response.on('error', (e) => {
            reject(e);
        });
        response.on('data', (chunk) => {
            data += chunk;
        });
    });
    request.on('error', (e) => {
        reject(e);
    });
    if (body) {
        request.end(body);
    } else {
        request.end();
    }
}

function request(hostname, port, path, method, headers, body) {
    let options = {
        protocol: 'http:',
        hostname,
        port,
        path,
        method,
        headers,
        agent: httpAgent,
    };
    return new Promise((resolve, reject) => {
        _doRequest(options, body, resolve, reject);
    });
}

module.exports = {
    request,
};
