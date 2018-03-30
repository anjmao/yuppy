export class Package {
    public readonly name: string;
    public readonly path: string;
    public readonly scripts: { [index: string]: string };

    constructor(opt: {name: string, path: string, scripts: { [index: string]: string }}) {
        this.name = opt.name;
        this.path = opt.path;
        this.scripts = opt.scripts;
    }

    getCmd(scriptName: string): string | null {
        const keys = Object.keys(this.scripts);
        const key = keys.find(x => x.indexOf(scriptName) > -1);
        let cmd = this.scripts[key];
        if (!cmd) {
           return null;
        }
        for (let k of keys) {
            if (k !== key) {
                const v = this.scripts[k];
                if (cmd.indexOf(`$${k}`) > -1) {
                    cmd = cmd.replace(`$${k}`, v);
                }
            }
        }
        return cmd;
    }
}
