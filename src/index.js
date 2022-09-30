const logger = require('./logger');
const { LEANSER_ENABLED } = require('./configs');
const { ExtensionsClient } = require('./client/extensionsClient');

let registered = false;

async function _initExtension() {
    logger.debug('Initializing extension ...');

    logger.debug('Creating extensions client ...');
    const client = new ExtensionsClient();
    logger.debug('Created extensions client');

    logger.debug('Registering extension ...');
    const id = await client.register('leanser', []);
    logger.debug(`Registered extension with id ${id}`);

    if (!id) {
        logger.error(
            'Extension ID is not set. Skipping extension registration ...'
        );
        return;
    }

    registered = true;

    logger.debug('Calling for next event ...');
    await client.nextEvent(id);
    logger.debug('Called for next event');
}

async function register(...cb) {
    if (!LEANSER_ENABLED) {
        logger.debug('Skipping registration as it is disabled');
        return;
    }
    if (registered) {
        logger.warn('Skipping registration as it is already registered');
        return;
    }
    try {
        process.on('SIGTERM', async () => {
            logger.debug('Triggering registered callbacks on terminate ...');
            await Promise.all(cb.map((c) => c()));
            logger.debug(
                'Triggered registered callbacks on terminate. Process exiting ...'
            );
            process.exit(0);
        });

        logger.debug('Initializing extension ...');
        // This will never complete because it’s a no-op extension.
        // Since the extension doesn't subscribe to any event,
        // the "next" call is blocked forever.
        await _initExtension();
        logger.debug('Initialized extension');
    } catch (err) {
        logger.error('Failed to register extension', err);
    }
}

module.exports = {
    register,
};
