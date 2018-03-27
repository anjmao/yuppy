export class YuppyConfig {
    public readonly projects: Project[];
    constructor(opt: { projects: Project[] }) {
        this.projects = opt.projects;
    }
}

export class Project {
    public readonly name: string;
    public readonly path: string;
    public readonly commands: { [index: string]: string };

    constructor(opt: {name: string, path: string, commands: { [index: string]: string }}) {
        this.name = opt.name;
        this.path = opt.path;
        this.commands = opt.commands;
    }
}