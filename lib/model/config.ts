import { Package } from './package';

export interface ConfigSchema {
    forceCommitMessage?: string;
    globalPaths?: string[];
    packages: {
        name: string;
        paths: string[];
        baseDevBranch?: string;
        scripts: { [index: string]: string };
    }[];
}

export class Config {
    public readonly packages: Package[] = [];
    public readonly forceCommitMessage?: string;
    public readonly globalPaths: string[] = [];

    constructor(opt: ConfigSchema) {
        this.forceCommitMessage = opt.forceCommitMessage;
        this.globalPaths = opt.globalPaths || [];
        if (!opt.packages) {
            throw new Error(`Invalid configuration: packages must be defined`);
        }
        if (!Array.isArray(opt.packages)) {
            throw new Error(`Invalid configuration: packages must be an array`);
        }
        for (const pkg of opt.packages) {
            if (!pkg.name) {
                throw new Error(`Invalid configuration: package name should be defined`);
            }
            if (pkg.paths && !Array.isArray(pkg.paths)) {
                throw new Error('Invalid configuration: package paths must be an array');
            }
        }
        this.packages = opt.packages.map((x) => new Package({
            name: x.name,
            paths: x.paths,
            baseDevBranch: x.baseDevBranch,
            scripts: x.scripts
        }));
    }

    getProject(name: string) {
        return this.packages.find(x => x.name === name);
    }
}
