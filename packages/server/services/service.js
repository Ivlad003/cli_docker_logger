var Docker = require('dockerode');
const StrategicFileStorage = require('./StrategicFileStorage');

module.exports = class ContainersService {
    #streamsMap;
    #containersMap;
    #containersList;
    #docker;

    constructor() {
        this.#streamsMap = new Map();
        this.#containersMap = new Map();
        this.#containersList = [];
        this.#docker = new Docker({ socketPath: '/var/run/docker.sock' });
        this.strategicFileStorage = new StrategicFileStorage();
    }

    async refresh() {
        await this.#fillContainersMap();
        await this.#fillContainersList();
    }

    getList() {
        return this.#containersList.filter((container) => {
            return !this.#streamsMap.has(container.split(':')[1]);
        });
    }

    getAttachedtList() {
        return this.#containersList.filter((container) => {
            return this.#streamsMap.has(container.split(':')[1]);
        });
    }

    #fillContainersMap() {
        return new Promise((resolve, reject) => {
            this.#containersMap.clear();
            this.#docker.listContainers((err, containers) => {
                if (err) {
                    reject(err);
                }
                containers.forEach((containerInfo) => {
                    this.#containersMap.set(containerInfo.Id, this.#docker.getContainer(containerInfo.Id))
                });
                resolve();
            });
        });

    }

    #fillContainersList() {
        return new Promise((resolve, reject) => {
            this.#containersList = [];
            this.#docker.listContainers((err, containers) => {
                if (err) {
                    reject(err);
                }
                containers.forEach((containerInfo) => {
                    this.#containersList.push(`${containerInfo.Names[0]}:${containerInfo.Id}`);
                });

                resolve();
            });
        });

    }

    async #getStreamMonitoring(container) {
        const stream = await(new Promise((resolve, reject) => {
            container.logs({
                follow: true,
                stdout: true,
                stderr: true
            }, function (err, stream) {
                if (err) {
                    reject(err);
                } else {
                    resolve(stream);
                }
            });
        }));

        return stream;
    }

    async attacheLogsStorageMonitoring(id) {
        if (!this.#containersMap.has(id)) {
            throw new Error(`Container with id ${id} not found`);
        }

        if (this.#streamsMap.has(id)) {
            throw new Error(`Container with id ${id} already attached`);
        }

        const container = this.#containersMap.get(id);
        const stream = await this.#getStreamMonitoring(container);
        this.strategicFileStorage.attachStream(id, stream);
        this.strategicFileStorage.initSystemListeners(id, stream);
        this.#streamsMap.set(container.id, stream);
        return stream;
    }

    deattacheLogsMonitoring(id) {
        if (!this.#streamsMap.has(id)) {
            throw new Error(`Container with id ${id} not found`);
        }
        const stream = this.#streamsMap.get(id);
        this.strategicFileStorage.detachStream(id, stream);
        stream.destroy();
        this.#streamsMap.delete(id);
    }
}