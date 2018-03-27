const path = require('path');
module.exports = {
    mode: 'development',
    entry: './apps/vue/app.js',
    output: {
        path: path.resolve(__dirname, '../dist/vue')
    },
    resolve: {
        extensions: ['.js'],
    },
}