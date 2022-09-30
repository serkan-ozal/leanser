const { LEANSER_DEBUG_ENABLED } = require('./configs');

module.exports.debug = function (msg) {
    if (LEANSER_DEBUG_ENABLED) {
        console.debug('[LEANSER]', msg);
    }
};

module.exports.info = function (msg) {
    console.info('[LEANSER]', msg);
};

module.exports.warn = function (msg) {
    console.warn('[LEANSER]', msg);
};

module.exports.error = function (msg, e) {
    console.error('[LEANSER]', msg, e);
};
