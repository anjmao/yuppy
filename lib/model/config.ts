import { Package } from './package';

export interface ConfigSchema {
    packages: {
        name: string;
        path: string;
        scripts: { [index: string]: string };
    }[];
}

export class Config {
    public readonly packages: Package[];
    constructor(opt: { packages: Package[] }) {
        this.packages = opt.packages;
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
        }
        const packages = config.packages.map((x) => new Package({name: x.name, path: x.path, scripts: x.scripts}));
        return new Config({packages: packages});
    }

    getProject(name: string) {
        return this.packages.find(x => x.name === name);
    }
}
