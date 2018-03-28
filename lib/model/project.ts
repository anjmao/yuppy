
export class Project {
    public readonly name: string;
    public readonly path: string;
    public readonly tasks: { [index: string]: string };

    constructor(opt: {name: string, path: string, tasks: { [index: string]: string }}) {
        this.name = opt.name;
        this.path = opt.path;
        this.tasks = opt.tasks;
    }

    getCmd(taskName: string) {
        const key = Object.keys(this.tasks).find(x => x.indexOf(taskName) > -1);
        return this.tasks[key];
    }
}
