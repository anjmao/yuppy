import { Project } from './project';

export class Config {
    public readonly projects: Project[];
    constructor(opt: { projects: Project[] }) {
        this.projects = opt.projects;
    }
}
