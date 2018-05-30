import { execSync } from 'child_process';

export function gitExists() {
    return execSync('git version');
}

export function gitDiff(ref: string) {
    const buffer = execSync(`git diff ${ref} --name-only`);
    return buffer.toString().split('\n').filter(line => !!line); 
}

export function getLastCommitMessage() {
    const buffer = execSync(`git log -1`);
    return buffer.toString().trim();
}
