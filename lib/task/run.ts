import { YuppyConfig } from '../model/config';

const { runCommand } = require('../cmd-util/cmd-util');

export interface RunTaskOptions {
    command: string;
    parallel: boolean;
    stopOnFail: boolean;
    skipUnchanged: boolean;
}

export default async function (opt: RunTaskOptions, config: YuppyConfig) {
    const tasksFn = [];
    for (const project of config.projects) {
        const key = Object.keys(project.commands).find(x => x.indexOf(opt.command) > -1);
        const cmd = project.commands[key];
        tasksFn.push(() => runCommand(opt.command, cmd));
    };
    
    if (opt.parallel) {
        const tasks = tasksFn.map(t => t());
        return Promise.all(tasks).then(() => 0);
    } else {
        for (const tFn of tasksFn) {
            try {
                await tFn();
            } catch (err) {
                if (opt.stopOnFail) {
                    return Promise.reject(`failed to run coerr`);
                }
            }
        }
    }

    return Promise.resolve(0);;
};
