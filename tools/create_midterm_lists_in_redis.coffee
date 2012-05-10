_ = require("underscore")
async = require("async")
analytics = require("../api/analytics")
api = require("../api/api")
redis = require("redis").createClient()

undergrads = ["test", "admin", "naltimim@ucsd.edu","aamodei@ucsd.edu","latkins@ucsd.edu","aauyeung@ucsd.edu","mawasthi@ucsd.edu","ebarney@ucsd.edu","tbarnsto@ucsd.edu","cjbarton@ucsd.edu","sbijanpo@ucsd.edu","e1bloom@ucsd.edu","nbonanno@ucsd.edu","dbseiso@ucsd.edu","jcalais@ucsd.edu","svcampos@ucsd.edu","kcarrasc@ucsd.edu","amchambe@ucsd.edu","joc013@ucsd.edu","vwchang@ucsd.edu","wachao@ucsd.edu","ayc011@ucsd.edu","lwchen@ucsd.edu","rlc001@ucsd.edu","lwc001@ucsd.edu","yhc001@ucsd.edu","jwc025@ucsd.edu","gchuck@ucsd.edu","jcoss@ucsd.edu","ocostanz@ucsd.edu","tcranfor@ucsd.edu","rccuella@ucsd.edu","rcusing@ucsd.edu","sdangelo@ucsd.edu","jldejesu@ucsd.edu","jdefalco@ucsd.edu","mdejosep@ucsd.edu","bdhaliwa@ucsd.edu","gsdhillo@ucsd.edu","jjdiamon@ucsd.edu","tdomingo@ucsd.edu","ccduong@ucsd.edu","l2duong@ucsd.edu","amfreema@ucsd.edu","jgarafal@ucsd.edu","vngarcia@ucsd.edu","rgosavi@ucsd.edu","cgov@ucsd.edu","vaguerre@ucsd.edu","mgumina@ucsd.edu","pguzman@ucsd.edu","csha@ucsd.edu","kjhaley@ucsd.edu","hnhall@ucsd.edu","nhalstea@ucsd.edu","sharihar@ucsd.edu","crharmon@ucsd.edu","aheredic@ucsd.edu","jherzber@ucsd.edu","tahirota@ucsd.edu","tbhoang@ucsd.edu","vkhollin@ucsd.edu","sfhoward@ucsd.edu","jyhsi@ucsd.edu","eehsieh@ucsd.edu","thuezo@ucsd.edu","aphunter@ucsd.edu","rihu@ucsd.edu","nishiko@ucsd.edu","cjameson@ucsd.edu","akamgarp@ucsd.edu","nskanani@ucsd.edu","myk009@ucsd.edu","rkedlaya@ucsd.edu","emk005@ucsd.edu","hhk007@ucsd.edu","dkrishna@ucsd.edu","lakumar@ucsd.edu","rolam@ucsd.edu","a4lau@ucsd.edu","klavi@ucsd.edu","abl004@ucsd.edu","c7le@ucsd.edu","jnl004@ucsd.edu","ttl018@ucsd.edu","tlederge@ucsd.edu","erl004@ucsd.edu","jhl054@ucsd.edu","sol015@ucsd.edu","jil066@ucsd.edu","chl159@ucsd.edu","t9lin@ucsd.edu","clinsche@ucsd.edu","mcliu@ucsd.edu","tsliu@ucsd.edu","slunardi@ucsd.edu","elundste@ucsd.edu","siluong@ucsd.edu","amacari@ucsd.edu","cmagana@ucsd.edu","lmai@ucsd.edu","smandavg@ucsd.edu","smannino@ucsd.edu","kmanveli@ucsd.edu","jcmcelfr@ucsd.edu","elmeltze@ucsd.edu","ntmercer@ucsd.edu","ametzler@ucsd.edu","jmeyers@ucsd.edu","smezher@ucsd.edu","kmiu@ucsd.edu","e3moon@ucsd.edu","rnassimi@ucsd.edu","sneugros@ucsd.edu","qpnguyen@ucsd.edu","tbn006@ucsd.edu","tbn004@ucsd.edu","tin006@ucsd.edu","nnocum@ucsd.edu","aknoda@ucsd.edu","asobrien@ucsd.edu","rmohara@ucsd.edu","aworr@ucsd.edu","aoveroye@ucsd.edu","apainter@ucsd.edu","apatil@ucsd.edu","jperches@ucsd.edu","kapeterk@ucsd.edu","spetit@ucsd.edu","nppham@ucsd.edu","adphuong@ucsd.edu","raportil@ucsd.edu","fqafiti@ucsd.edu","qquarles@ucsd.edu","kmquigle@ucsd.edu","creuter@ucsd.edu","earivera@ucsd.edu","grorem@ucsd.edu","krosendo@ucsd.edu","rsablove@ucsd.edu","asaini@ucsd.edu","lrsakata@ucsd.edu","psamermi@ucsd.edu","ssamples@ucsd.edu","d2scott@ucsd.edu","eseubert@ucsd.edu","m8shin@ucsd.edu","isimpelo@ucsd.edu","lesolano@ucsd.edu","v1solis@ucsd.edu","wstahl@ucsd.edu","csubrahm@ucsd.edu","psukaviv@ucsd.edu","jrsyang@ucsd.edu","gtalan@ucsd.edu","rtalia@ucsd.edu","bltang@ucsd.edu","dtang@ucsd.edu","dttran@ucsd.edu","jet004@ucsd.edu","a1tse@ucsd.edu","emtse@ucsd.edu","etuma@ucsd.edu","alturner@ucsd.edu","mudo@ucsd.edu","mrvargas@ucsd.edu","jvillads@ucsd.edu","mwedeen@ucsd.edu","nawells@ucsd.edu","mrwestfa@ucsd.edu","jcw020@ucsd.edu","k8wong@ucsd.edu","elyang@ucsd.edu","gtyang@ucsd.edu","v2yu@ucsd.edu"]

alternateprobes = ['4f8439abe6afa5c8260028f3','4f84398be6afa5c8260028c7','4f84398ce6afa5c8260028c9','4f843a12e6afa5c82600296e','4f8439e6e6afa5c82600293a','4f843980e6afa5c8260028b8','4f843981e6afa5c8260028b9','4f843982e6afa5c8260028ba','4f843983e6afa5c8260028bc','4f84399fe6afa5c8260028e2','4f84399fe6afa5c8260028e3','4f843974e6afa5c8260028a6','4f843a06e6afa5c826002960']

nuggetprobes = {}
nuggetpoints = {}

api.db.collection("course").findOne _id: new api.ObjectId("4f78e9a5e6ef81971e000001"), (err, course) =>
    
    course.nuggets.forEach (nugget) =>
        nuggetprobes[nugget._id] = (probe._id.toString() for probe in (nugget.probeset or []))
        nuggetpoints[nugget._id] = 0 #(probe.answers?.length for probe in (nugget.probeset or [])).reduce ((t, s) -> t + s), 0

    undergrads.forEach reset_user_midterm

reset_user_midterm = (email) =>
    console.log "Processing", email
    analytics.get_student_nugget_attempts email, (err, claimednuggets) =>
        if err
            console.log "Error getting stats for", email, err
            return
        
        claimed = []
        points = 0
        claimednuggets.forEach (nugget) =>
            claimed.push.apply claimed, nuggetprobes[nugget._id]
            points += nuggetpoints[nugget._id]
        if claimed.length != _.uniq(claimed).length
            console.log "DUPLICATES!!!", email, claimed.length, _.uniq(claimed).length
        
        claimed = _.shuffle(claimed)
        alternate = _.shuffle(alternateprobes)
        
        answered_key = "midterm-answered:" + email
        unanswered_key = "midterm-unanswered:" + email
        claimed_key = "midterm-claimed:" + email
        alternate_key = "midterm-alternate:" + email
        
        redis.set "midterm-claimed-points:" + email, points
        
        redis.del answered_key, unanswered_key, claimed_key, alternate_key, =>
            alternate.forEach (probe) =>
                redis.lpush alternate_key, probe
            claimed.forEach (probe) =>
                redis.lpush claimed_key, probe
            console.log "completed", email
        
