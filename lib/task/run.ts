import { Package } from '../model/package';
import { runCommand } from '../util/cmd-util';
import { SUCCESS_CODE } from '../model/constant';
import  * as git from '../util/git-util';
import { Config } from '../model/config';

export interface RunTaskOptions {
    scriptNames: string[];
    parallel?: boolean;
    maxParallelScripts?: number;
    stopOnFail?: boolean;
    skipUnchanged?: boolean;
}

type TaskFn = () => Promise<any>;

export async function runTask(opt: RunTaskOptions, config: Config): Promise<number> {
    let packages = config.packages;
    if (opt.skipUnchanged) {
        if (!git.gitExists()) {
            return Promise.reject('Git is required when using skipUnchanged');
        }
        packages = filterChangedPackages(packages, config.forceCommitMessage);
    }

    const runInParallel = async (tasksFn: TaskFn[]) => {
        if (opt.maxParallelScripts) {
            const buckets = createTasksBuckets(tasksFn, opt.maxParallelScripts);
            let success = true;
            for (const bucket of buckets) {
                try {
                    const tasks = bucket.map(t => t());
                    await Promise.all(tasks)
                } catch {
                    success = false;
                }
            }
            return success ? Promise.resolve() : Promise.reject(null);
        } else {
            const tasks = tasksFn.map(t => t());
            return Promise.all(tasks);
        }
    };

    const runInOrder = async (tasksFn: TaskFn[]) => {
        let success = true;
        for (const tFn of tasksFn) {
            try {
                await tFn();
            } catch (err) {
                success = false;
                if (opt.stopOnFail) {
                    return Promise.reject(err);
                }
            }
        }
        return success ? Promise.resolve() : Promise.reject(null);
    };

    const runTask = async (taskName: string) => {
        const tasksFn: TaskFn[] = [];
        for (const project of packages) {
            const cmd = project.getCmd(taskName);
            if (cmd) {
                tasksFn.push(() => runCommand(cmd));
            }
        }
        if (tasksFn.length === 0) {
            if (!opt.skipUnchanged) {
                return Promise.reject(`Runnable commands for script "${taskName}" was not found`);
            }
            return Promise.resolve(SUCCESS_CODE);
        }

        if (opt.parallel) {
            return runInParallel(tasksFn);
        } else {
            return runInOrder(tasksFn);
        }
    };

    for (let taskName of opt.scriptNames) {
        try {
            await runTask(taskName);
        } catch (err) {
            return Promise.reject(err);
        }
    }
    return Promise.resolve(SUCCESS_CODE);
};

function filterChangedPackages(packages: Package[], forceCommitMessage?: string): Package[] {
    if (forceCommitMessage) {
        const lastCommit = git.getLastCommitMessage();
        if (lastCommit.indexOf(forceCommitMessage)) {
            return packages;
        }
    }
    const diffs: { [index: string]: string[] } = {};
    const pkgs: Package[] = [];
    for (const pkg of packages) {
        const changes = diffs[pkg.baseDevBranch] || git.gitDiff(`..${pkg.baseDevBranch}`);
        diffs[pkg.baseDevBranch] = changes;
        for (const path of pkg.paths) {
            let found = false;
            for (const change of changes) {
                if (change.indexOf(path) > -1) {
                    found = true;
                    break;
                }
            }
            if (found) {
                pkgs.push(pkg);
                continue;
            }
        }
    }
    return pkgs;
}

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
