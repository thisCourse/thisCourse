({
    appDir: 'src',
    baseUrl: './',
    //Uncomment to turn off uglify minification.
    optimize: 'none',
    dir: 'build',
    paths: {
        cs: 'cs',
        hb: 'hb',
        less: 'less'
    },
    pragmasOnSave: {
        excludeCoffeeScript: true,
        excludeHandlebars: true,
        excludeLESS: true
    },
    modules: [
        {
            name: "bootloader"
        }
    ],
    optimizeCss: false
})
