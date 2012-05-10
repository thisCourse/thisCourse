_ = require("underscore")
async = require("async")
analytics = require("../api/analytics")
api = require("../api/api")
redis = require("redis").createClient()

undergrads = ["test", "admin", "naltimim@ucsd.edu","aamodei@ucsd.edu","latkins@ucsd.edu","aauyeung@ucsd.edu","mawasthi@ucsd.edu","ebarney@ucsd.edu","tbarnsto@ucsd.edu","cjbarton@ucsd.edu","sbijanpo@ucsd.edu","e1bloom@ucsd.edu","nbonanno@ucsd.edu","dbseiso@ucsd.edu","jcalais@ucsd.edu","svcampos@ucsd.edu","kcarrasc@ucsd.edu","amchambe@ucsd.edu","joc013@ucsd.edu","vwchang@ucsd.edu","wachao@ucsd.edu","ayc011@ucsd.edu","lwchen@ucsd.edu","rlc001@ucsd.edu","lwc001@ucsd.edu","yhc001@ucsd.edu","jwc025@ucsd.edu","gchuck@ucsd.edu","jcoss@ucsd.edu","ocostanz@ucsd.edu","tcranfor@ucsd.edu","rccuella@ucsd.edu","rcusing@ucsd.edu","sdangelo@ucsd.edu","jldejesu@ucsd.edu","jdefalco@ucsd.edu","mdejosep@ucsd.edu","bdhaliwa@ucsd.edu","gsdhillo@ucsd.edu","jjdiamon@ucsd.edu","tdomingo@ucsd.edu","ccduong@ucsd.edu","l2duong@ucsd.edu","amfreema@ucsd.edu","jgarafal@ucsd.edu","vngarcia@ucsd.edu","rgosavi@ucsd.edu","cgov@ucsd.edu","vaguerre@ucsd.edu","mgumina@ucsd.edu","pguzman@ucsd.edu","csha@ucsd.edu","kjhaley@ucsd.edu","hnhall@ucsd.edu","nhalstea@ucsd.edu","sharihar@ucsd.edu","crharmon@ucsd.edu","aheredic@ucsd.edu","jherzber@ucsd.edu","tahirota@ucsd.edu","tbhoang@ucsd.edu","vkhollin@ucsd.edu","sfhoward@ucsd.edu","jyhsi@ucsd.edu","eehsieh@ucsd.edu","thuezo@ucsd.edu","aphunter@ucsd.edu","rihu@ucsd.edu","nishiko@ucsd.edu","cjameson@ucsd.edu","akamgarp@ucsd.edu","nskanani@ucsd.edu","myk009@ucsd.edu","rkedlaya@ucsd.edu","emk005@ucsd.edu","hhk007@ucsd.edu","dkrishna@ucsd.edu","lakumar@ucsd.edu","rolam@ucsd.edu","a4lau@ucsd.edu","klavi@ucsd.edu","abl004@ucsd.edu","c7le@ucsd.edu","jnl004@ucsd.edu","ttl018@ucsd.edu","tlederge@ucsd.edu","erl004@ucsd.edu","jhl054@ucsd.edu","sol015@ucsd.edu","jil066@ucsd.edu","chl159@ucsd.edu","t9lin@ucsd.edu","clinsche@ucsd.edu","mcliu@ucsd.edu","tsliu@ucsd.edu","slunardi@ucsd.edu","elundste@ucsd.edu","siluong@ucsd.edu","amacari@ucsd.edu","cmagana@ucsd.edu","lmai@ucsd.edu","smandavg@ucsd.edu","smannino@ucsd.edu","kmanveli@ucsd.edu","jcmcelfr@ucsd.edu","elmeltze@ucsd.edu","ntmercer@ucsd.edu","ametzler@ucsd.edu","jmeyers@ucsd.edu","smezher@ucsd.edu","kmiu@ucsd.edu","e3moon@ucsd.edu","rnassimi@ucsd.edu","sneugros@ucsd.edu","qpnguyen@ucsd.edu","tbn006@ucsd.edu","tbn004@ucsd.edu","tin006@ucsd.edu","nnocum@ucsd.edu","aknoda@ucsd.edu","asobrien@ucsd.edu","rmohara@ucsd.edu","aworr@ucsd.edu","aoveroye@ucsd.edu","apainter@ucsd.edu","apatil@ucsd.edu","jperches@ucsd.edu","kapeterk@ucsd.edu","spetit@ucsd.edu","nppham@ucsd.edu","adphuong@ucsd.edu","raportil@ucsd.edu","fqafiti@ucsd.edu","qquarles@ucsd.edu","kmquigle@ucsd.edu","creuter@ucsd.edu","earivera@ucsd.edu","grorem@ucsd.edu","krosendo@ucsd.edu","rsablove@ucsd.edu","asaini@ucsd.edu","lrsakata@ucsd.edu","psamermi@ucsd.edu","ssamples@ucsd.edu","d2scott@ucsd.edu","eseubert@ucsd.edu","m8shin@ucsd.edu","isimpelo@ucsd.edu","lesolano@ucsd.edu","v1solis@ucsd.edu","wstahl@ucsd.edu","csubrahm@ucsd.edu","psukaviv@ucsd.edu","jrsyang@ucsd.edu","gtalan@ucsd.edu","rtalia@ucsd.edu","bltang@ucsd.edu","dtang@ucsd.edu","dttran@ucsd.edu","jet004@ucsd.edu","a1tse@ucsd.edu","emtse@ucsd.edu","etuma@ucsd.edu","alturner@ucsd.edu","mudo@ucsd.edu","mrvargas@ucsd.edu","jvillads@ucsd.edu","mwedeen@ucsd.edu","nawells@ucsd.edu","mrwestfa@ucsd.edu","jcw020@ucsd.edu","k8wong@ucsd.edu","elyang@ucsd.edu","gtyang@ucsd.edu","v2yu@ucsd.edu"]

alternateprobes = ["4f843989e6afa5c8260028c5", "4f843a17e6afa5c826002973", "4f843a19e6afa5c826002976", "4f8439cae6afa5c826002918", "4f843a0ce6afa5c826002967", "4f8439ffe6afa5c826002958", "4f8439d2e6afa5c826002922", "4f8439e1e6afa5c826002935", "4f843a12e6afa5c82600296e", "4f8439cee6afa5c82600291d", "4f8439efe6afa5c826002945", "4f8439cce6afa5c82600291b", "4f8439c3e6afa5c826002910", "4f8439bde6afa5c826002908", "4f8439ece6afa5c826002941", "4f843a05e6afa5c82600295f", "4f843978e6afa5c8260028ad", "4f8439a4e6afa5c8260028ea", "4f84396be6afa5c826002899", "4f843a03e6afa5c82600295c", "4f8439a0e6afa5c8260028e4", "4f8439a8e6afa5c8260028ef", "4f8439bce6afa5c826002907", "4f84399de6afa5c8260028e0", "4f84396ae6afa5c826002897", "4f8439a5e6afa5c8260028eb", "4f84397fe6afa5c8260028b6", "4f84398ce6afa5c8260028c9", "4f8439d3e6afa5c826002923", "4f843a13e6afa5c82600296f", "4f84398de6afa5c8260028cb", "4f843a0ee6afa5c826002969", "4f8439d0e6afa5c826002920", "4f843a00e6afa5c826002959", "4f8439bfe6afa5c82600290b", "4f843997e6afa5c8260028d9", "4f843a19e6afa5c826002975", "4f843971e6afa5c8260028a2", "4f843987e6afa5c8260028c2", "4f843962e6afa5c82600288b", "4f8439c8e6afa5c826002916", "4f8439c7e6afa5c826002915", "4f84396ce6afa5c82600289b", "4f843a0ae6afa5c826002965", "4f84398de6afa5c8260028ca", "4f8439cee6afa5c82600291e", "4f84397de6afa5c8260028b3", "4f843a08e6afa5c826002962", "4f843993e6afa5c8260028d3", "4f8439f0e6afa5c826002946", "4f8439f3e6afa5c82600294a", "4f8439ade6afa5c8260028f5", "4f843a15e6afa5c826002971", "4f843964e6afa5c82600288f", "4f8439f9e6afa5c826002951", "4f843976e6afa5c8260028a9", "4f843981e6afa5c8260028b9", "4f8439c1e6afa5c82600290e", "4f8439ebe6afa5c826002940", "4f84399be6afa5c8260028dd", "4f84398ee6afa5c8260028cc", "4f8439fee6afa5c826002957", "4f8439e7e6afa5c82600293b", "4f8439f8e6afa5c826002950", "4f8439e3e6afa5c826002937", "4f8439e1e6afa5c826002934", "4f8439b2e6afa5c8260028fa", "4f84396fe6afa5c82600289e", "4f8439cae6afa5c826002919", "4f843980e6afa5c8260028b8", "4f843995e6afa5c8260028d6", "4f843982e6afa5c8260028ba", "4f843984e6afa5c8260028be", "4f8439a3e6afa5c8260028e8", "4f84397ee6afa5c8260028b5", "4f84397ae6afa5c8260028af", "4f8439aee6afa5c8260028f7", "4f8439d5e6afa5c826002926", "4f8439bde6afa5c826002909", "4f8439aae6afa5c8260028f1", "4f843977e6afa5c8260028ab", "4f8439cde6afa5c82600291c", "4f84398ae6afa5c8260028c6", "4f8439e7e6afa5c82600293c", "4f8439a7e6afa5c8260028ed", "4f8439f7e6afa5c82600294f", "4f8439d6e6afa5c826002927", "4f8439bbe6afa5c826002906", "4f843973e6afa5c8260028a4", "4f84399ae6afa5c8260028dc", "4f8439a7e6afa5c8260028ee", "4f843992e6afa5c8260028d1", "4f8439a1e6afa5c8260028e5", "4f843964e6afa5c82600288e", "4f8439ace6afa5c8260028f4", "4f8439b6e6afa5c8260028ff", "4f843a01e6afa5c82600295a", "4f8439a4e6afa5c8260028e9", "4f8439e6e6afa5c82600293a", "4f843997e6afa5c8260028d8", "4f843975e6afa5c8260028a8", "4f8439d3e6afa5c826002924", "4f8439f4e6afa5c82600294b", "4f8439e4e6afa5c826002938", "4f843963e6afa5c82600288d", "4f84396de6afa5c82600289c", "4f8439e9e6afa5c82600293e", "4f8439c5e6afa5c826002912", "4f843961e6afa5c82600288a", "4f8439b2e6afa5c8260028fb", "4f8439dbe6afa5c82600292d", "4f8439f6e6afa5c82600294d", "4f8439fbe6afa5c826002953", "4f8439ede6afa5c826002943", "4f843a16e6afa5c826002972", "4f84396fe6afa5c82600289f", "4f8439b3e6afa5c8260028fc", "4f843988e6afa5c8260028c3", "4f8439a2e6afa5c8260028e6", "4f84399ce6afa5c8260028df", "4f843972e6afa5c8260028a3", "4f843984e6afa5c8260028bd", "4f8439afe6afa5c8260028f8", "4f843992e6afa5c8260028d2", "4f84398be6afa5c8260028c8", "4f8439dce6afa5c82600292e", "4f8439d8e6afa5c82600292a", "4f8439b9e6afa5c826002903", "4f8439fae6afa5c826002952", "4f843978e6afa5c8260028ac", "4f8439e8e6afa5c82600293d", "4f84396ae6afa5c826002898", "4f8439d7e6afa5c826002928", "4f843a04e6afa5c82600295e", "4f8439dae6afa5c82600292c", "4f843979e6afa5c8260028ae", "4f8439c2e6afa5c82600290f", "4f8439b4e6afa5c8260028fd", "4f843975e6afa5c8260028a7", "4f8439abe6afa5c8260028f3", "4f8439fce6afa5c826002954", "4f84397be6afa5c8260028b0", "4f843974e6afa5c8260028a6", "4f8439eae6afa5c82600293f", "4f843999e6afa5c8260028db", "4f8439b1e6afa5c8260028f9", "4f843a0de6afa5c826002968", "4f843990e6afa5c8260028ce", "4f843a14e6afa5c826002970", "4f8439bee6afa5c82600290a", "4f8439d8e6afa5c826002929", "4f84399fe6afa5c8260028e2", "4f8439cbe6afa5c82600291a", "4f843a12e6afa5c82600296d", "4f8439dde6afa5c82600292f", "4f8439f1e6afa5c826002947", "4f8439c1e6afa5c82600290d", "4f8439a9e6afa5c8260028f0", "4f843a1ae6afa5c826002977", "4f843a07e6afa5c826002961", "4f8439d4e6afa5c826002925", "4f8439abe6afa5c8260028f2"]

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
        
