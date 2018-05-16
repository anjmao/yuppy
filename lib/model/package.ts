
export interface PackageCtrArgs {
    name: string;
    paths?: string[];
    forceCommitMessage?: string;
    baseDevBranch?: string;
    scripts: { [index: string]: string };
}

export class Package {
    public readonly name: string;
    public readonly baseDevBranch: string;
    public readonly paths: string[];
    public readonly forceCommitMessage?: string;
    public readonly scripts: { [index: string]: string };

    constructor(opt: PackageCtrArgs) {
        this.name = opt.name;
        this.paths = opt.paths;
        this.baseDevBranch = opt.baseDevBranch || 'master';
        this.forceCommitMessage = opt.forceCommitMessage; 
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
