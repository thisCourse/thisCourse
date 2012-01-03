// require.config({
  // paths: {
    // 'jquery': '/static/libs/js/jquery'
  // }
// })

// require all the non-AMD libraries, in order, to be bundled with the AMD modules
require([
	'libs/jquery'
])

define(["cs!test2"], function(test2) {
    console.log("defining test1")
    console.log(test2.x)
    return {
        x: 33
    }
})
