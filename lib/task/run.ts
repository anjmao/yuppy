import { Project } from '../model/config';
import { runCommand } from '../cmd-util/cmd-util';

export interface RunTaskOptions {
    command: string;
    parallel?: boolean;
    maxParallelTasks?: number;
    stopOnFail?: boolean;
    skipUnchanged?: boolean;
}

export default async function (opt: RunTaskOptions, projects: Project[]) {
    const tasksFn = [];
    for (const project of projects) {
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
                    return Promise.reject(`error running command: ${err}`);
                }
            }
        }
    }

    return Promise.resolve(0);;
};
