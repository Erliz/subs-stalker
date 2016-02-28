import transports from './transport';

class Notifier {
    constructor(transportList, title = '') {
        this.transports = [];
        transportList.forEach(transport => {
            if (transport instanceof transports.TransportInterface) {
                this.transports.push(transport);
            } else {
                throw new TypeError(transport + ' not implement TransportInterface');
            }
        });

        this.title = title;

    }

    notify({title = '', body = ''}) {
        let notifications = [];
        this.transports.forEach((transport) => {
            notifications.push(transport.send({
                title: this.title + title,
                body
            }));
        });

        if (!notifications.length) {
            notifications.push(Promise.resolve());
        }

        return Promise.race(notifications);
    }
}

export {Notifier, transports};