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
        const packages = config.packages.map((x) => new Package({name: x.name, path: x.path, scripts: x.scripts}));
        return new Config({packages: packages});
    }

    getProject(name: string) {
        return this.packages.find(x => x.name === name);
    }
}
