import {Logger, transports} from 'winston';

/* istanbul ignore next */
export default (service = 'app', level = 'info') => {
    return new Logger({
        transports: [new (transports.Console)({
            timestamp: () => '[' + new Date().toLocaleString('ru', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            }) + ']',
            level: level,
            label: service,
            name: 'console',
            formatter: (options) => options.timestamp() + ' ' + options.label +'.'+ options.level.toUpperCase() +': '+
                (undefined !== options.message ? options.message : '') +
                (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' )
        })]
    })
};
