import { Package } from './package';

export interface ConfigSchema {
    forceCommitMessage?: string;
    packages: {
        name: string;
        paths: string[];
        baseDevBranch?: string;
        scripts: { [index: string]: string };
    }[];
}

export class Config {
    public readonly packages: Package[];
    public readonly forceCommitMessage?: string;
    constructor(opt: { forceCommitMessage?: string; packages: Package[] }) {
        this.packages = opt.packages;
        this.forceCommitMessage = opt.forceCommitMessage;
    }

    static deserialize(config: ConfigSchema): Config {
        if (!config.packages) {
            throw new Error(`Invalid configuration: packages must be defined`);
        }
        if (!Array.isArray(config.packages)) {
            throw new Error(`Invalid configuration: packages must be an array`);
        }
        for (const pkg of config.packages) {
            if (!pkg.name) {
                throw new Error(`Invalid configuration: package name should be defined`);
            }
            if (pkg.paths && !Array.isArray(pkg.paths)) {
                throw new Error('Invalid configuration: package paths must be an array');
            }
        }
        const packages = config.packages.map((x) => new Package({
            name: x.name,
            paths: x.paths,
            baseDevBranch: x.baseDevBranch,
            scripts: x.scripts
        }));
        return new Config({ forceCommitMessage: config.forceCommitMessage, packages: packages });
    }

    getProject(name: string) {
        return this.packages.find(x => x.name === name);
    }
}
