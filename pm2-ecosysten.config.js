module.exports = {
    apps: [{
        name: 'nestjs-api',
        script: './dist/src/main.js',
        env: {
            NODE_ENV: 'production',
        }
    }]
};