class IStrategicFileStorage {
    attachStream(id, stream) {
        throw new Error('Method attachStream() must be implemented');
    }

    detachStream(id, stream) {
        throw new Error('Method detachStream() must be implemented');
    }

    initSystemListeners(id, stream) {
        throw new Error('Method initSystemListeners() must be implemented');
    }
}

module.exports = IStrategicFileStorage;
