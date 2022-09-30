const httpClient = require('./httpClient');

const LAMBDA_EXTENSION_VERSION = '2020-01-01';
const LAMBDA_EXTENSION_NAME = 'lambda-extension-name';
const LAMBDA_EXTENSION_IDENTIFIER = 'lambda-extension-identifier';

function _getRuntimeAPIInfo() {
    if (process.env.AWS_LAMBDA_RUNTIME_API) {
        try {
            const runtimeAPIInfoParts =
                process.env.AWS_LAMBDA_RUNTIME_API.split(':');
            if (runtimeAPIInfoParts.length === 2) {
                return {
                    hostname: runtimeAPIInfoParts[0],
                    port: parseInt(runtimeAPIInfoParts[1], 10),
                };
            } else {
                throw new Error(
                    `'AWS_LAMBDA_RUNTIME_API' format is invalid: ${process.env.AWS_LAMBDA_RUNTIME_API}`
                );
            }
        } catch (e) {
            throw new Error(`Unable to get Runtime API info: ${e}`);
        }
    }
    throw new Error(`'AWS_LAMBDA_RUNTIME_API' env var is not set`);
}

class ExtensionsClient {
    constructor() {
        const runtimeAPIInfo = _getRuntimeAPIInfo();
        this.hostname = runtimeAPIInfo.hostname;
        this.port = runtimeAPIInfo.port;
    }

    getExtensionId() {
        return this.extensionId;
    }

    async register(name, events) {
        const headers = {
            [LAMBDA_EXTENSION_NAME]: name,
            'Content-Type': 'application/json',
        };
        const body = {
            events: events,
        };

        const res = await httpClient.request(
            this.hostname,
            this.port,
            `/${LAMBDA_EXTENSION_VERSION}/extension/register`,
            'POST',
            headers,
            JSON.stringify(body)
        );

        if (res.status !== 200) {
            throw new Error(`Failed to register extension: ${res.status}`);
        }

        this.extensionId = res.headers[LAMBDA_EXTENSION_IDENTIFIER];

        return this.extensionId;
    }

    async nextEvent(id) {
        if (!id && !this.extensionId) {
            throw new Error('Extension ID is not set');
        }

        const headers = {
            [LAMBDA_EXTENSION_IDENTIFIER]: id || this.extensionId,
            'Content-Type': 'application/json',
        };

        const res = await httpClient.request(
            this.hostname,
            this.port,
            `/${LAMBDA_EXTENSION_VERSION}/extension/event/next`,
            'GET',
            headers
        );

        if (res.status !== 200) {
            throw new Error(`Failed to get next event: ${res.status}`);
        }
    }
}

module.exports = {
    ExtensionsClient,
};
