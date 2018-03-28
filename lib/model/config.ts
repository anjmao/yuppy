import { Project } from './project';

export interface ConfigSchema {
    projects: {
        name: string;
        path: string;
        tasks: { [index: string]: string };
    }[];
}

export class Config {
    public readonly projects: Project[];
    constructor(opt: { projects: Project[] }) {
        this.projects = opt.projects;
    }

    static deserialize(config: ConfigSchema): Config {
        const projects = config.projects.map((x) => new Project({name: x.name, path: x.path, tasks: x.tasks}));
        return new Config({projects: projects});
    }

    getProject(name: string) {
        return this.projects.find(x => x.name === name);
    }
}
