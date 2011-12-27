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
    //This pragma excludes the CoffeeScript compiler code
    //from the optimized source, since all CoffeeScript files
    //are converted and inlined into the main.js built file.
    //If you still want to allow dynamic loading of CoffeeScript
    //files after a build, comment out the pragmasOnSave section.
    pragmasOnSave: {
        excludeCoffeeScript: true,
        excludeHandlebars: true,
        excludeLESS: true
    },
    modules: [
        {
            name: "test1"
        }
    ]
})
