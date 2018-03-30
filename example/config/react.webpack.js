const path = require('path');
module.exports = {
    mode: 'development',
    entry: './apps/react/app.js',
    output: {
        path: path.resolve(__dirname, '../dist/react')
    },
    resolve: {
        extensions: ['.js'],
    },
}