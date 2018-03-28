import { Project } from '../model/project';
import { runCommand } from '../cmd-util/cmd-util';

export interface RunTaskOptions {
    task: string;
    parallel?: boolean;
    maxParallelTasks?: number;
    stopOnFail?: boolean;
    skipUnchanged?: boolean;
}

const SUCCESS_CODE = 0;

export default async function (opt: RunTaskOptions, projects: Project[]): Promise<number> {
    const tasksFn = [];
    for (const project of projects) {
        const cmd = project.getCmd(opt.task);
        tasksFn.push(() => runCommand(opt.task, cmd));
    };
    
    if (opt.parallel) {
        const tasks = tasksFn.map(t => t());
        return Promise.all(tasks).then(() => SUCCESS_CODE);
    } else {
        for (const tFn of tasksFn) {
            try {
                await tFn();
            } catch (err) {
                if (opt.stopOnFail) {
                    return Promise.reject(err);
                }
            }
        }
    }

    return Promise.resolve(SUCCESS_CODE);
};
