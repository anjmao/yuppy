import { Package } from '../model/package';
import { runCommand } from '../util/cmd-util';
import { SUCCESS_CODE } from '../model/constant';
import  * as git from '../util/git-util';
import { Config } from '../model/config';
import { info } from '../trace';

export interface RunTaskOptions {
    scriptNames: string[];
    parallel?: boolean;
    maxParallelScripts?: number;
    stopOnFail?: boolean;
    skipUnchanged?: boolean;
}

type TaskFn = () => Promise<any>;

export async function runTask(opt: RunTaskOptions, config: Config): Promise<number> {
    info('run options', opt)
    let packages = config.packages;
    if (opt.skipUnchanged) {
        if (!git.gitExists()) {
            return Promise.reject('Git is required when using skipUnchanged');
        }
        packages = filterChangedPackages(packages, config.forceCommitMessage, config.globalPaths);
        info('changed packages', packages.map(x => x.name));
    }

    const run = async (taskName: string) => {
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
            return runInParallel(tasksFn, opt.maxParallelScripts);
        } else {
            return runInOrder(tasksFn, opt.stopOnFail);
        }
    };

    for (let taskName of opt.scriptNames) {
        try {
            await run(taskName);
        } catch (err) {
            return Promise.reject(err);
        }
    }
    return Promise.resolve(SUCCESS_CODE);
}

async function runInOrder(tasksFn: TaskFn[], stopOnFail = false) {
    let success = true;
    for (const tFn of tasksFn) {
        try {
            await tFn();
        } catch (err) {
            success = false;
            if (stopOnFail) {
                return Promise.reject(err);
            }
        }
    }
    return success ? Promise.resolve() : Promise.reject(null);
}

async function runInParallel(tasksFn: TaskFn[], maxParallelScripts = 0) {
    if (maxParallelScripts > 0) {
        const buckets = createTasksBuckets(tasksFn, maxParallelScripts);
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
}

function filterChangedPackages(packages: Package[], forceCommitMessage?: string, globalPaths: string[] = []): Package[] {
    if (forceCommitMessage) {
        const lastCommit = git.getLastCommitMessage();
        if (lastCommit.indexOf(forceCommitMessage)) {
            return packages;
        }
    }

    const diffs: { [index: string]: string[] } = {};
    const pkgs: Package[] = [];
    const pathChangesFound = (path: string, changes: string[]) => {
        for (const change of changes) {
            if (change.indexOf(path) > -1) {
                return true
            }
        }
        return false
    };

    for (const pkg of packages) {
        const changes = diffs[pkg.baseDevBranch] || git.gitDiff(`..${pkg.baseDevBranch}`);
        diffs[pkg.baseDevBranch] = changes;
        for (const gPath of globalPaths) {
            if (pathChangesFound(gPath, changes)) {
                return packages;
            }
        }
        for (const path of pkg.paths) {
            if (pathChangesFound(path, changes)) {
                pkgs.push(pkg);
                break;
            }
        }
    }
    return pkgs;
}

function createTasksBuckets(tasksFn: TaskFn[], bucketSize: number): TaskFn[][] {
    let bucket: TaskFn[] = [];
    const res: TaskFn[][] = [];
    tasksFn.forEach((taskFn, i) => {
        bucket.push(taskFn);
        if (bucket.length === bucketSize || i === tasksFn.length - 1) {
            res.push(bucket);
            bucket = [];
        }
    })
    return res;
}
