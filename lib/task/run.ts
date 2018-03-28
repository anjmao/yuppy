import { Project } from '../model/project';
import { runCommand } from '../cmd-util/cmd-util';
import { SUCCESS_CODE } from '../model/constant';

export interface RunTaskOptions {
    task: string;
    parallel?: boolean;
    maxParallelTasks?: number;
    stopOnFail?: boolean;
    skipUnchanged?: boolean; // TODO
}

type TaskFn = () => Promise<any>;

export default async function (opt: RunTaskOptions, projects: Project[]): Promise<number> {
    const tasksFn: TaskFn[] = [];
    for (const project of projects) {
        const cmd = project.getCmd(opt.task);
        if (cmd) {
            tasksFn.push(() => runCommand(cmd));
        }
    };

    if (opt.parallel) {
        if (opt.maxParallelTasks) {
            const buckets = createTasksBuckets(tasksFn, opt.maxParallelTasks);
            for (const bucket of buckets) {
                try {
                    const tasks = bucket.map(t => t());
                    await Promise.all(tasks)
                } catch (err) {
                    console.log(err);
                }
            }
            return Promise.resolve(SUCCESS_CODE);
        } else {
            const tasks = tasksFn.map(t => t());
            return Promise.all(tasks).then(() => SUCCESS_CODE);
        }
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

function createTasksBuckets(tasksFn: TaskFn[], bucketSize: number): TaskFn[][] {
    let bucket: TaskFn[] = [];
    return tasksFn.reduce((c, n, i) => {
        bucket.push(n);
        if (bucket.length === bucketSize || i === tasksFn.length - 1) {
            c.push(bucket);
            bucket = [];
        }
        return c;
    }, []);
}