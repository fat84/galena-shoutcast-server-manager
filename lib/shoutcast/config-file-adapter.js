import fs from 'fs';
import readline from 'readline';
import Server from '../galena/server';

function _writePairsToFile(data, filename) {
    return new Promise((resolve, reject) => {
        var wstream = fs.createWriteStream(filename);

        wstream.on('finish', resolve);
        wstream.on('error', reject);

        for (var key in data)
            if (data.hasOwnProperty(key))
                wstream.write(`${key}=${data[key]}\r\n`);

        wstream.end();
    });
}

function _readPairsFormFile(filename) {
    return new Promise((resolve, reject) => {

        let pattern = /^(\w+)=(.+)/g;
        let data = {};

        var lineReader = readline.createInterface({
            input: fs.createReadStream(filename)
        });

        lineReader.on('line', (line) => {
            if (pattern.test(line)) {
                let lineData = pattern.match(line);
                data[lineData[0]] = lineData[1];
            }
        });

        lineReader.on('finish', () => resolve(data));
        lineReader.on('error', reject);
    });
}


export default class ConfigFileAdapter {
    constructor() {
        // Object.assign(this, {
        //     logs: config.serverLogs,
        // });
    }

    writeOnFile(filename, server) {
        let data = {};

        data['screenlog'] = 1;
        data['portbase'] = server.portBase;
        data['maxuser'] = server.maxuser;
        data['password'] = server.password;
        data['adminpassword'] = server.adminPassword;
        data['logfile'] = '';//`${this.logs}/${server.id}_serv.log`;
        data['w3clog'] = '';//`${this.logs}/${server.id}_w3c.log`;

        if (server.isPublic)
            data['publicserver'] = 'always';
        else
            data['publicserver'] = 'never';

        return _writePairsToFile(data, filename);
    }

    readFromFile(filename) {
        return _readPairsFormFile(filename)
            .then((data) => {
                return new Server({
                    portBase: data['portbase'],
                    maxuser: data['maxuser'],
                    password: data['password'],
                    adminPassword: data['adminpassword'],
                    public: (data['publicserver'].toLowerCase() === 'always' ? true : false)
                });
            });
    }
}
