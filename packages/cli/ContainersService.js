module.exports = class ContainersService {
    constructor() {
        this.url = 'http://localhost:3000';
    }

    extractId(container) {
        return container.split(':')[1];
    }

    async getList() {
        const response = await fetch(`${this.url}/containers`);
        if (!response.ok) {
            throw new Error('Error while fetching containers list ' + response.statusText);
        }
        return await response.json();
    }

    async getAttachedList() {
        const response = await fetch(`${this.url}/containers/attaches`);
        if (!response.ok) {
            throw new Error('Error while fetching containers list ' + response.statusText);
        }
        return await response.json();
    }

    async attachLoggerStorage(container) {
        const id = this.extractId(container);
        const response = await fetch(`${this.url}/containers/attach/${id}`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('/containers/attach ' + response.statusText);
        }
        return await response.json();
    }

    async detachLoggerStorage(container) {
        const id = this.extractId(container);
        const response = await fetch(`${this.url}/containers/deatach/${id}`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('/containers/deatach ' + response.statusText);
        }
        return await response.json();
    }
}