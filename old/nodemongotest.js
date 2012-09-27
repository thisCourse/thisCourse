var mongoskin = require("mongoskin")
var mongodb = require("mongodb")
var ObjectId = mongodb.BSONPure.ObjectID
var db = mongoskin.db("localhost/test")
var async = require("async")

var docs = db.collection("docs")
//docs.find({price: {$lt: 1}}).each(console.log)
//docs.find({name: /^ctr/}).explain(console.log)

var departments = ["COGS", "LIGN", "CSE", "PSYC", "PHIL", "MATH"]

var widget_types = ["book", "teacher", "text", "event"]

var teachers = ["Jamie Alexandre", "Isabelle Tancioni", "Micah Bregman", "Ben Cipollini"]
var roles = ["TA", "IA", "Professor"]
var offices = ["CSB223", "CSB165", "MAND334", "AP&M4242"]

var event_types = ["lecture", "due date", "field trip", "exam"]

function rand_choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function random_widget(type) {
    
    switch(type) {
    
        case "book":
            return {
                title: random_string(20),
                isbn: 1000000000 + Math.round(Math.random() * 7000000000),
                price: Math.random() * 200
            }
        case "teacher":
            return {
                name: rand_choice(teachers),
                title: rand_choice(roles),
                office: rand_choice(offices)
            }
        case "text":
            return {
                title: random_string(Math.round(Math.random() * 15 + 5)),
                html: random_string(Math.round(Math.random() * 150 + 5))
            }
        case "event":
            return {
                type: rand_choice(event_types),
                name: random_string(Math.round(Math.random() * 15 + 5)),
                date: new Date(2011, Math.floor(Math.random() * 12)+1, Math.floor(Math.random() * 27)+1)
            }
    }
    

}

function random_course_id() { return rand_choice(departments) + (Math.random() * 200 + 1).toFixed(); }

function random_string(len) { s = ""; for (var j=0; j < len; j++) { s += String.fromCharCode(97 + 26*Math.random()); } return s; }

var courses = db.collection("courses")

for (var i=0; i<0; i++) {

    var obj = {};
    obj.course_id = random_course_id();

    obj.sections = [];
    
    var section_count = Math.floor(Math.random() * 10);

    for (var j=0; j<section_count; j++) {
    
        var widget_count = Math.floor(Math.random() * 12);
        var section = {type: rand_choice(widget_types), widgets: []};        
        
        for (var k=0; k<widget_count; k++) {
        
            var widget = random_widget(section.type);
            widget._id = new ObjectId;
            section.widgets.push(widget);
        
        }
        
        section._id = new ObjectId;
        
        obj.sections.push(section);
    
    }    
    
    courses.save(obj)
    
}

function get_by_id(arr, id) {
    for (var i=0; i<arr.length; i++) {
        if (arr[i]._id.equals(id)) return arr[i]
    }
    return null
}

function get_path(ids, get_path_callback) {

    // course_id, section_id, widget_id

    async.waterfall([
        function(callback) {
            courses.findOne({_id: ObjectId(ids.course_id)}, callback)
        },
        function(course, callback) {
            if (ids.section_id===undefined) { get_path_callback(null, course); return }
            var section = get_by_id(course.sections, ids.section_id)
            if (ids.widget_id===undefined) { get_path_callback(null, section); return }
            get_path_callback(null, get_by_id(section.widgets, ids.widget_id))
        }
    ], get_path_callback)
}

get_path({course_id: "4e6075a045419e910a00e68c", section_id: "4e6075a045419e910a00e684", widget_id: "4e6075a045419e910a00e680"}, console.log)

path = "/course/4e6075a045419e910a00e68c/section/4e6075a045419e910a00e684/widget/4e6075a045419e910a00e680/"

path.split("/").filter(function(m) { return m.length > 0 })


// var base64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

// String.fromCharCode(parseInt("5a", 16))


// hex: each character stores 2^4 vals
// b64: each character stores 2^6 vals
