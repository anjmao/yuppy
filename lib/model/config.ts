export interface YuppyConfig {
    projects: Project[];
}

export interface Project {
    name: string;
    path: string;
    commands: { [index: string]: string }
}