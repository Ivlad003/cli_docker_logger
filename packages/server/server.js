const fastify = require('fastify')({
    logger: true
});

const ContainersService = require('./services/service');
const containersService = new ContainersService();

fastify.get('/containers', async () => {
    await containersService.refresh();
    const list = containersService.getList();
    return list || [];
});

fastify.get('/containers/attaches', async () => {
    await containersService.refresh();
    const list = containersService.getAttachedtList();
    return list || [];
});


fastify.post('/containers/attach/:id', async (request) => {
    containersService.attacheLogsStorageMonitoring(request.params.id);
    return { ok: true };
});

fastify.post('/containers/deatach/:id', async (request) => {
    containersService.deattacheLogsMonitoring(request.params.id);
    return { ok: true };
});

const start = async () => {
    try {
        await fastify.listen(3000);
        fastify.log.info(`server listening on ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();
