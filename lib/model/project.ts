
export class Project {
    public readonly name: string;
    public readonly path: string;
    public readonly tasks: { [index: string]: string };

    constructor(opt: {name: string, path: string, tasks: { [index: string]: string }}) {
        this.name = opt.name;
        this.path = opt.path;
        this.tasks = opt.tasks;
    }

    getCmd(taskName: string): string | null {
        const keys = Object.keys(this.tasks);
        const key = keys.find(x => x.indexOf(taskName) > -1);
        let cmd = this.tasks[key];
        if (!cmd) {
           return null;
        }
        for (let k of keys) {
            if (k !== key) {
                const v = this.tasks[k];
                if (cmd.indexOf(`$${k}`) > -1) {
                    cmd = cmd.replace(`$${k}`, v);
                }
            }
        }
        return cmd;
    }
}
