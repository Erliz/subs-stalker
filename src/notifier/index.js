import PushBullet from 'pushbullet';
const title = 'Subs-Stalker: ';
let notifier = () => { throw new Error('PushBullet error: Api key not set') };
let devices = [];
let messagesToSend = [];

function handleDevicesResponse(devicesIdsToNotify, availableDevices) {
    availableDevices.forEach((device) => {
        if (!device.active) {
            return;
        }
        if (devicesIdsToNotify.indexOf(device.iden) > -1) {
            devices.push(device.iden);
        }
    });
}

function setDevices(devices) {
    devices = Array.isArray(devices) ? devices : [devices];
    notifier.devices((error, response) => {
        if (error) {
            throw error;
        }
        handleDevicesResponse(devices, response.devices);
    });
}

function setApiKey(apiKey) {
    notifier = new PushBullet(apiKey);
}

function notify(message, action='') {
    messagesToSend.push({title: title + action, body: message});
}

function init(apiKey, devices) {
    setApiKey(apiKey);
    setDevices(devices);
    sender();
}

function sender() {
    setTimeout(() => {
        let message = messagesToSend.pop();
        if (message) {
            devices.forEach((deviceId) => {
                console.log(`send message "${message.title}": "${message.body}" to device id ${deviceId}`);
                notifier.note(deviceId, message.title, message.body, function (error, response) {
                    if (error) {
                        console.log(error);
                        messagesToSend.push(message)
                    }
                });
            });
        }
        sender();
    }, 10000);
}

export default {init, notify};
