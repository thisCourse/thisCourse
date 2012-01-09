({
    appDir: 'src',
    baseUrl: './',
    optimize: 'none',
    dir: 'build',
    paths: {
        cs: 'libs/requirejs/cs',
        domReady: 'libs/requirejs/domReady',
        hb: 'libs/requirejs/hb',
        less: 'libs/requirejs/less',
        order: 'libs/requirejs/order',
        text: 'libs/requirejs/text'
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
