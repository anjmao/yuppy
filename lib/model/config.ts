import { Project } from './project';

export class Config {
    public readonly projects: Project[];
    constructor(opt: { projects: Project[] }) {
        this.projects = opt.projects;
    }

    static deserialize(config: any): Config {
        const projects = config.projects.map((x: any) => new Project({name: x.name, path: x.path, tasks: x.commands}));
        return new Config({projects: projects});
    }
}
