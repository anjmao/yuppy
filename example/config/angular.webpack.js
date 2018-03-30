const path = require('path');
module.exports = {
    mode: 'development',
    entry: './apps/angular/app.js',
    output: {
        path: path.resolve(__dirname, '../dist/angular')
    },
    resolve: {
        extensions: ['.js'],
    },
}