const ContainersService = require('./ContainersService');
const containersService = new ContainersService();
const term = require('terminal-kit').terminal;
const fs = require('fs');
let selectedLogStream = null;

const actions = ['Attach', 'Deatach', 'Readlog', 'exit']

term.cyan('CLI utility for managing Docker container logs,\n');

function clearTerminal() {
    // Check the operating system
    const isWindows = process.platform === "win32";

    if (isWindows) {
        // Windows command to clear terminal
        console.log('\x1B[2J\x1B[0f');
    } else {
        // Unix/Linux/MacOS command to clear terminal
        console.log('\x1Bc');
    }
}

const mapAction = {
    'Attach': async () => {
        const list = await containersService.getList();
        if (list.length == 0) {
            clearTerminal();
            term('\n').eraseLineBefore.error(
                "Attach list is empty:\n"
            );
            showTopLevelMenu();
            return;
        }
        list.push('exit');
        list.push('top');
        showOptionsList('Avalible for atach logs', list, async (container) => {
            await containersService.attachLoggerStorage(container)
            showTopLevelMenu();
        });
    },
    'Deatach': async () => {
        const list = await containersService.getAttachedList();
        if (list.length == 0) {
            clearTerminal();
            term('\n').eraseLineBefore.error(
                "Deatach list is empty:\n"
            );
            showTopLevelMenu();
            return;
        }
        list.push('exit');
        list.push('top');
        showOptionsList('List of already attached code select for deatach:', list, async (container) => {
            await containersService.detachLoggerStorage(container)
            showTopLevelMenu();
        });
    },
    'Readlog': async () => {
        const list = await containersService.getAttachedList();
        if (list.length == 0) {
            clearTerminal();
            term('\n').eraseLineBefore.error(
                "Readlog list is empty:\n"
            );
            showTopLevelMenu();
            return;
        }
        list.push('exit');
        list.push('top');
        showOptionsList('Select for read logs', list, async (container) => {
            if(selectedLogStream){
                selectedLogStream.destroy()
            }

            selectedLogStream = fs.createReadStream(`${containersService.extractId(container)}_logs.txt`, { encoding: 'utf8' });
            selectedLogStream.on('data', (chunk) => {
                chunk.split('\n').forEach((line) => {
                    console.log(line);
                })
            })
            selectedLogStream.on('error', (err) => {
                console.error(err);
            });
            selectedLogStream.on('end', () => {
               showTopLevelMenu();
            })
        });
    },
    'exit': () => {
        term.cyan('Thanks for using our tools:\n');
        process.exit();
    },
};

function showOptionsList(title, list, callback) {
    term.cyan(title + ':\n');
    term.singleColumnMenu(list, function (error, response) {
        if (response.selectedText == 'exit') {
            mapAction['exit']();
        }
        if (response.selectedText == 'top') {
            clearTerminal();
            showTopLevelMenu();
            return;
        }
        callback(response.selectedText);
        term('\n').eraseLineAfter.green(
            "selected: %s\n",
            response.selectedText
        );
    });

}

function showTopLevelMenu() {
    term.cyan('Select action:\n');
    term.singleColumnMenu(actions, function (error, response) {
        term('\n').eraseLineAfter.green(
            "selected: %s\n",
            response.selectedText
        );
        mapAction[response.selectedText]();
    });
}

showTopLevelMenu();