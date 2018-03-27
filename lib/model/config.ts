export interface YuppyConfig {
    projects: Project[];
}

export interface Project {
    name: string;
    commands: { [index: string]: string }
}