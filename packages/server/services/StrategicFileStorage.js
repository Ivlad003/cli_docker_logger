const fs = require('fs');
const IStrategicFileStorage = require('./IStrategicStorage');

module.exports = class StrategicFileStorage extends IStrategicFileStorage{
    #logFileMap = null;
    constructor() {
        super();
        this.#logFileMap = new Map();
    }

    attachStream(id, stream) {
        this.#logFileMap.set(id, fs.createWriteStream(`${id}_logs.txt`));
        stream.pipe(this.#logFileMap.get(id));
    }

    detachStream(id, stream) {
        stream.unpipe(this.#logFileMap.get(id));
    }

    initSystemListeners(id, stream) {
        stream.on('end', () => {
            console.log('Stream ended');
            this.#logFileMap.get(id).end();
        });
    }
}