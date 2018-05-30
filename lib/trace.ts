let enabled = false;

export function info(...messages: any[]) {
    if (enabled) {
        console.log(messages)
    }
}

export function enableTrance() {
    enabled = true;
}
