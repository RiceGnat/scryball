const WebSocket = require('ws').WebSocket;
const api = require('./api');

const token = process.env.BOT_TOKEN;
const gatewayParams = `?v=${api.version}&encoding=json`;

let gateway, commands;

const Session = function(interval) {
    this.interval = interval;
    this.id = null;
    this.s = null;
    let timer = null;
    let ack = null;
    this.sendHeartbeat = () => {
        this.cancelHeartbeat();
        if (ack === false) {
            console.log('No ACK received since last heartbeat');
            gateway.close(5000);
            resume(this.id, this.s);
        }
        else {
            ack = false;
            gateway.send(JSON.stringify({ op: 1, d: this.s }))
            timer = setTimeout(this.sendHeartbeat, this.interval + Math.floor(Math.random() * 2));
        }
    };
    this.ackHeartbeat = () => ack = true;
    this.cancelHeartbeat = () => {
        if (timer !== null) clearTimeout(timer)
        timer = null;
    };
};
let session;

const getGateway = async () => {
    const resp = await api.client.get('gateway');
    const gatewayHost = resp.data.url;

    console.log(`Got gateway URL: ${gatewayHost}`);

    return gatewayHost;
};

const connect = async () => {
    const gatewayHost = await getGateway();
    gateway = new WebSocket(`${gatewayHost}${gatewayParams}`);

    return new Promise((resolve, reject) => {
        gateway.on('open', () => {
            console.log('Gateway socket open');
            resolve();
        });
        gateway.on('close', () => {
            if (session) session.cancelHeartbeat();
            console.log('Gateway socket closed');
        });
        gateway.on('message', data => handleMessage(JSON.parse(data)));
    });
};

const identify = () => gateway.send(JSON.stringify({
    op: 2,
    d: {
        token,
        intents: 512,
        properties: {
            $os: process.platform,
            $browser: 'scryball',
            $device: 'scryball'
        }
    }
}));

const resume = (session_id, seq) => gateway.send(JSON.stringify({
    op: 6,
    d: { token, session_id, seq }
}));

const opcodes = {
    0: 'Dispatch',
    1: 'Heartbeat',
    7: 'Reconnect',
    9: 'Invalid Session',
    10: 'Hello',
    11: 'Heartbeat ACK'
};

const handleMessage = async data => {
    console.log(`Received opcode ${data.op}: ${opcodes[data.op]}`);

    switch (data.op) {
        case 10:
            session = new Session(data.d.heartbeat_interval);
            console.log(`Heartbeat interval: ${session.interval}`);
            session.sendHeartbeat();
            identify();
            break;
        case 1:
            session.sendHeartbeat();
            break;
        case 11:
            session.ackHeartbeat();
            break;
        case 0:
            console.log(`Received event ${data.s}: ${data.t}`);
            session.s = data.s;
            await handleDispatchEvent(data.t, data);
    }
};

const handleDispatchEvent = async (event, data) => {
    switch (event) {
        case 'READY':
            console.log(`Gateway session ready: ${data.d.session_id}`);
            console.log(`User identified: ${data.d.user.username}#${data.d.user.discriminator}`);
            break;
        case 'INTERACTION_CREATE':
            let response;

            try {
                response = await commands[data.d.data.name](data.d, data.d.data.options);
                console.log(`Command handled: ${data.d.data.name}`);
            }
            catch (err) {
                response = {
                    type: 4,
                    data: {
                        content: 'Something broke'
                    }
                };
                console.log(`Error handling command: ${data.d.type} ${data.d.data.name}`);
                console.log(err);
            }

            try {
                await api.client.post(`interactions/${data.d.id}/${data.d.token}/callback`, response);
                console.log(`Response sent`);
            }
            catch (err) {
                console.log(`Error sending interaction response: ${data.d.id}`);
                console.log(err);
            }

            break;
    }
}

const disconnect = () => {
    gateway.close(1000);
};

module.exports = {
    connect,
    disconnect,
    set commands(handlers) {
        commands = handlers;
    }
};
