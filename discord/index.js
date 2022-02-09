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
    const resp = await api.getGateway();
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
            resume(this.id, this.s);
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
    //console.log(`Received opcode ${data.op}: ${opcodes[data.op]}`);

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
            //console.log(`Received event ${data.s}: ${data.t}`);
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
            const args = commands[data.d.data.name].options.map(({ name }) => ((data.d.data.options || []).find(arg => arg.name === name) || {}).value);

            try {
                switch (data.d.type) {
                    case 2: // APPLICATION_COMMAND
                        response = await commands[data.d.data.name].onCommand(...args, data.d);
                        break;
                    case 4: // APPLICATION_COMMAND_AUTOCOMPLETE
                        response = await commands[data.d.data.name].onAutocomplete(...args, data.d);
                        break;
                }
            }
            catch (err) {
                response = {
                    type: 4,
                    data: {
                        content: 'Something broke'
                    }
                };
                console.log(`Error handling command: ${data.d.data.name}`);
                console.log(err);
            }

            try {
                await api.postInteractionResponse(data.d.id, data.d.token, response);
            }
            catch (err) {
                console.log(`Error sending interaction response: ${data.d.id}`);
                console.log(err);
            }

            break;
    }
}

const registerCommands = async defs => {
    try {
        let response = await api.putCommands(defs.filter(c => c.global));
        console.log(`Global commands registered: ${response.data.map(({ name }) => name).join(' ')}`);
    }
    catch (err) {
        console.log('Error registering commands:');
        console.log(err);
    }
}

module.exports = {
    connect,
    set commands(value) {
        commands = value.reduce((o, e) => ({ ...o, [e.name]: e }), {});
        registerCommands(value.map(({ name, type, description, options, global }) => ({ name, type, description, options, global })));
    }
};
