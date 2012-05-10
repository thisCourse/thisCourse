_ = require("underscore")
async = require("async")
analytics = require("../api/analytics")
api = require("../api/api")
redis = require("redis").createClient()

undergrads = ["test", "admin", "naltimim@ucsd.edu","aamodei@ucsd.edu","latkins@ucsd.edu","aauyeung@ucsd.edu","mawasthi@ucsd.edu","ebarney@ucsd.edu","tbarnsto@ucsd.edu","cjbarton@ucsd.edu","sbijanpo@ucsd.edu","e1bloom@ucsd.edu","nbonanno@ucsd.edu","dbseiso@ucsd.edu","jcalais@ucsd.edu","svcampos@ucsd.edu","kcarrasc@ucsd.edu","amchambe@ucsd.edu","joc013@ucsd.edu","vwchang@ucsd.edu","wachao@ucsd.edu","ayc011@ucsd.edu","lwchen@ucsd.edu","rlc001@ucsd.edu","lwc001@ucsd.edu","yhc001@ucsd.edu","jwc025@ucsd.edu","gchuck@ucsd.edu","jcoss@ucsd.edu","ocostanz@ucsd.edu","tcranfor@ucsd.edu","rccuella@ucsd.edu","rcusing@ucsd.edu","sdangelo@ucsd.edu","jldejesu@ucsd.edu","jdefalco@ucsd.edu","mdejosep@ucsd.edu","bdhaliwa@ucsd.edu","gsdhillo@ucsd.edu","jjdiamon@ucsd.edu","tdomingo@ucsd.edu","ccduong@ucsd.edu","l2duong@ucsd.edu","amfreema@ucsd.edu","jgarafal@ucsd.edu","vngarcia@ucsd.edu","rgosavi@ucsd.edu","cgov@ucsd.edu","vaguerre@ucsd.edu","mgumina@ucsd.edu","pguzman@ucsd.edu","csha@ucsd.edu","kjhaley@ucsd.edu","hnhall@ucsd.edu","nhalstea@ucsd.edu","sharihar@ucsd.edu","crharmon@ucsd.edu","aheredic@ucsd.edu","jherzber@ucsd.edu","tahirota@ucsd.edu","tbhoang@ucsd.edu","vkhollin@ucsd.edu","sfhoward@ucsd.edu","jyhsi@ucsd.edu","eehsieh@ucsd.edu","thuezo@ucsd.edu","aphunter@ucsd.edu","rihu@ucsd.edu","nishiko@ucsd.edu","cjameson@ucsd.edu","akamgarp@ucsd.edu","nskanani@ucsd.edu","myk009@ucsd.edu","rkedlaya@ucsd.edu","emk005@ucsd.edu","hhk007@ucsd.edu","dkrishna@ucsd.edu","lakumar@ucsd.edu","rolam@ucsd.edu","a4lau@ucsd.edu","klavi@ucsd.edu","abl004@ucsd.edu","c7le@ucsd.edu","jnl004@ucsd.edu","ttl018@ucsd.edu","tlederge@ucsd.edu","erl004@ucsd.edu","jhl054@ucsd.edu","sol015@ucsd.edu","jil066@ucsd.edu","chl159@ucsd.edu","t9lin@ucsd.edu","clinsche@ucsd.edu","mcliu@ucsd.edu","tsliu@ucsd.edu","slunardi@ucsd.edu","elundste@ucsd.edu","siluong@ucsd.edu","amacari@ucsd.edu","cmagana@ucsd.edu","lmai@ucsd.edu","smandavg@ucsd.edu","smannino@ucsd.edu","kmanveli@ucsd.edu","jcmcelfr@ucsd.edu","elmeltze@ucsd.edu","ntmercer@ucsd.edu","ametzler@ucsd.edu","jmeyers@ucsd.edu","smezher@ucsd.edu","kmiu@ucsd.edu","e3moon@ucsd.edu","rnassimi@ucsd.edu","sneugros@ucsd.edu","qpnguyen@ucsd.edu","tbn006@ucsd.edu","tbn004@ucsd.edu","tin006@ucsd.edu","nnocum@ucsd.edu","aknoda@ucsd.edu","asobrien@ucsd.edu","rmohara@ucsd.edu","aworr@ucsd.edu","aoveroye@ucsd.edu","apainter@ucsd.edu","apatil@ucsd.edu","jperches@ucsd.edu","kapeterk@ucsd.edu","spetit@ucsd.edu","nppham@ucsd.edu","adphuong@ucsd.edu","raportil@ucsd.edu","fqafiti@ucsd.edu","qquarles@ucsd.edu","kmquigle@ucsd.edu","creuter@ucsd.edu","earivera@ucsd.edu","grorem@ucsd.edu","krosendo@ucsd.edu","rsablove@ucsd.edu","asaini@ucsd.edu","lrsakata@ucsd.edu","psamermi@ucsd.edu","ssamples@ucsd.edu","d2scott@ucsd.edu","eseubert@ucsd.edu","m8shin@ucsd.edu","isimpelo@ucsd.edu","lesolano@ucsd.edu","v1solis@ucsd.edu","wstahl@ucsd.edu","csubrahm@ucsd.edu","psukaviv@ucsd.edu","jrsyang@ucsd.edu","gtalan@ucsd.edu","rtalia@ucsd.edu","bltang@ucsd.edu","dtang@ucsd.edu","dttran@ucsd.edu","jet004@ucsd.edu","a1tse@ucsd.edu","emtse@ucsd.edu","etuma@ucsd.edu","alturner@ucsd.edu","mudo@ucsd.edu","mrvargas@ucsd.edu","jvillads@ucsd.edu","mwedeen@ucsd.edu","nawells@ucsd.edu","mrwestfa@ucsd.edu","jcw020@ucsd.edu","k8wong@ucsd.edu","elyang@ucsd.edu","gtyang@ucsd.edu","v2yu@ucsd.edu"]

alternateprobes = ['4f8439abe6afa5c8260028f3','4f84398be6afa5c8260028c7','4f84398ce6afa5c8260028c9','4f843a12e6afa5c82600296e','4f8439e6e6afa5c82600293a','4f843980e6afa5c8260028b8','4f843981e6afa5c8260028b9','4f843982e6afa5c8260028ba','4f843983e6afa5c8260028bc','4f84399fe6afa5c8260028e2','4f84399fe6afa5c8260028e3','4f843974e6afa5c8260028a6','4f843a06e6afa5c826002960']

nuggetprobes = {}
nuggetpoints = {'4f79de11ebfd0b4b31000001': 3, '4f79de15ebfd0b4b3100000f': 1, '4f79de16ebfd0b4b31000014': 5, '4f79de19ebfd0b4b3100001f': 4, '4f79de1debfd0b4b3100002d': 4, '4f79de1febfd0b4b31000032': 3, '4f79de23ebfd0b4b31000043': 7, '4f79de2aebfd0b4b3100005a': 5, '4f79de31ebfd0b4b31000074': 9, '4f79de33ebfd0b4b31000079': 4, '4f79de36ebfd0b4b31000084': 1, '4f79de39ebfd0b4b3100008c': 3, '4f79de3bebfd0b4b31000094': 1, '4f79de3eebfd0b4b3100009f': 1, '4f79de40ebfd0b4b310000a4': 2, '4f79de42ebfd0b4b310000ac': 6, '4f79de46ebfd0b4b310000b7': 1, '4f79de48ebfd0b4b310000bf': 1, '4f79de4aebfd0b4b310000c4': 1, '4f79de4bebfd0b4b310000c9': 1, '4f79de4debfd0b4b310000ce': 1, '4f79de51ebfd0b4b310000dc': 3, '4f79de54ebfd0b4b310000e4': 2, '4f79de57ebfd0b4b310000ef': 1, '4f79de5aebfd0b4b310000f7': 2, '4f79de5debfd0b4b31000102': 3, '4f79de5febfd0b4b31000107': 6, '4f79de66ebfd0b4b3100011e': 7, '4f79de6aebfd0b4b31000129': 2, '4f79de6cebfd0b4b3100012e': 11, '4f79de70ebfd0b4b3100013c': 2, '4f79de72ebfd0b4b31000141': 1, '4f79de75ebfd0b4b31000149': 5, '4f79de7bebfd0b4b3100015a': 1, '4f79de7debfd0b4b3100015f': 2, '4f79de80ebfd0b4b31000167': 3, '4f79de84ebfd0b4b31000172': 3, '4f79de86ebfd0b4b31000177': 2, '4f79de8debfd0b4b3100018b': 1, '4f79de90ebfd0b4b31000193': 2, '4f79de94ebfd0b4b3100019e': 1, '4f79de98ebfd0b4b310001a6': 2, '4f79de9debfd0b4b310001b4': 7, '4f79dea4ebfd0b4b310001c5': 1, '4f79dea9ebfd0b4b310001d3': 1, '4f79deacebfd0b4b310001d8': 1, '4f79deaeebfd0b4b310001dd': 1, '4f79deb1ebfd0b4b310001e5': 2, '4f79deb5ebfd0b4b310001ed': 1, '4f79deb7ebfd0b4b310001f2': 3, '4f79debcebfd0b4b31000200': 1, '4f79dec1ebfd0b4b3100020b': 1, '4f79dec5ebfd0b4b31000216': 2, '4f79dec8ebfd0b4b3100021b': 2, '4f79decbebfd0b4b31000223': 1, '4f79deceebfd0b4b3100022b': 1, '4f79ded1ebfd0b4b31000230': 1, '4f79ded4ebfd0b4b31000238': 2, '4f79ded7ebfd0b4b3100023d': 1, '4f79dedcebfd0b4b31000248': 2, '4f79dedfebfd0b4b31000250': 2, '4f79dee5ebfd0b4b3100025e': 2, '4f79dee7ebfd0b4b31000263': 2, '4f79deeeebfd0b4b31000274': 4, '4f79def3ebfd0b4b3100027f': 1, '4f79def7ebfd0b4b31000287': 1, '4f79def9ebfd0b4b3100028c': 5, '4f79defeebfd0b4b31000297': 1, '4f79df01ebfd0b4b3100029c': 2, '4f79df03ebfd0b4b310002a1': 1, '4f79df06ebfd0b4b310002a6': 2, '4f79df08ebfd0b4b310002ab': 3, '4f79df0bebfd0b4b310002b0': 1, '4f79df0eebfd0b4b310002b5': 2, '4f79df13ebfd0b4b310002c0': 3, '4f79df19ebfd0b4b310002ce': 1, '4f79df1eebfd0b4b310002d9': 1, '4f79df22ebfd0b4b310002e1': 4, '4f79df2aebfd0b4b310002f2': 1, '4f79df2cebfd0b4b310002f7': 2, '4f79df79ebfd0b4b31000305': 3, '4f79df7debfd0b4b3100030d': 3, '4f79df84ebfd0b4b3100031b': 1, '4f79df87ebfd0b4b31000320': 2, '4f79df91ebfd0b4b31000334': 4, '4f79df96ebfd0b4b3100033f': 2, '4f79df99ebfd0b4b31000344': 2, '4f79df9eebfd0b4b3100034c': 1, '4f79dfa3ebfd0b4b31000357': 1, '4f79dfa6ebfd0b4b3100035c': 1, '4f79dfadebfd0b4b3100036a': 3, '4f79dfb2ebfd0b4b31000375': 4, '4f79dfb9ebfd0b4b31000383': 2, '4f79dfc3ebfd0b4b3100038b': 1, '4f79dfc7ebfd0b4b31000390': 1, '4f79dfcbebfd0b4b31000395': 2, '4f79dfcfebfd0b4b3100039d': 1, '4f79dfd3ebfd0b4b310003a2': 6, '4f79dfd7ebfd0b4b310003aa': 2, '4f79dfdaebfd0b4b310003af': 1, '4f79dfdeebfd0b4b310003b7': 2, '4f79dfe3ebfd0b4b310003bf': 1, '4f79dfe7ebfd0b4b310003c7': 1, '4f79dfecebfd0b4b310003cf': 1, '4f79dfefebfd0b4b310003d4': 1, '4f79dff2ebfd0b4b310003d9': 2, '4f79dff8ebfd0b4b310003e4': 1, '4f79dffdebfd0b4b310003ec': 2, '4f79e000ebfd0b4b310003f1': 1, '4f79e003ebfd0b4b310003f6': 3, '4f79e00bebfd0b4b31000404': 4, '4f79e010ebfd0b4b3100040f': 1, '4f79e014ebfd0b4b31000414': 5, '4f79e018ebfd0b4b3100041c': 1, '4f79e01cebfd0b4b31000421': 2, '4f79e01febfd0b4b31000426': 5, '4f79e024ebfd0b4b3100042e': 1, '4f79e027ebfd0b4b31000433': 2, '4f79e02aebfd0b4b31000438': 1, '4f79e02debfd0b4b3100043d': 3, '4f79e032ebfd0b4b31000445': 3, '4f79e03aebfd0b4b31000453': 1, '4f79e03debfd0b4b31000458': 1, '4f79ee07ebfd0b4b31000460': 1, '4f79ee0cebfd0b4b31000468': 1, '4f79ee0febfd0b4b3100046d': 1, '4f79ee13ebfd0b4b31000472': 1, '4f79ee1aebfd0b4b3100047d': 1, '4f79ee22ebfd0b4b3100048b': 1, '4f79ee26ebfd0b4b31000490': 2, '4f79ee2cebfd0b4b3100049b': 1, '4f79ee30ebfd0b4b310004a0': 1, '4f79ee39ebfd0b4b310004ad': 1, '4f79ee3debfd0b4b310004b2': 1, '4f79ee40ebfd0b4b310004b7': 1, '4f79ee44ebfd0b4b310004bc': 1, '4f79ee48ebfd0b4b310004c1': 1, '4f79ee4febfd0b4b310004cc': 1, '4f79ee54ebfd0b4b310004d4': 1, '4f79ee58ebfd0b4b310004d9': 1, '4f79ee5febfd0b4b310004e4': 1, '4f79ee63ebfd0b4b310004e9': 1, '4f79ee6aebfd0b4b310004f3': 1, '4f79ee73ebfd0b4b31000500': 1, '4f79ee77ebfd0b4b31000505': 2, '4f79ee83ebfd0b4b31000519': 1, '4f79ee8debfd0b4b31000527': 1, '4f79ee91ebfd0b4b3100052c': 1, '4f79ee95ebfd0b4b31000531': 1, '4f79ee9cebfd0b4b3100053c': 1, '4f79eea0ebfd0b4b31000541': 1, '4f79eea4ebfd0b4b31000546': 1, '4f79eea8ebfd0b4b3100054b': 1, '4f7a29e14290760b0a000009': 2, '4f7a2b6c4290760b0a000011': 1, '4f7a2c934290760b0a000016': 1, '4f7dff82c66e822015000001': 289, '4f8da847e7c1e32517000059': 0, '4f8dd2de8222299f19000015': 0, '4f8dd2de8222299f19000016': 0, '4f8dd2df8222299f19000017': 0, '4f8dd2e08222299f19000018': 0, '4f8dd2e18222299f19000019': 0, '4f8dd2e18222299f1900001a': 0, '4f8dd2e28222299f1900001b': 0, '4f8dd2e38222299f1900001c': 0, '4f8dd2e48222299f1900001d': 0, '4f8dd2e48222299f1900001e': 0, '4f8dd2e58222299f1900001f': 0, '4f8dd2e68222299f19000020': 0, '4f8dd2e78222299f19000021': 0, '4f8dd2e78222299f19000022': 0, '4f8dd2e88222299f19000023': 0, '4f8dd2e98222299f19000024': 0, '4f8dd2ea8222299f19000025': 0, '4f8dd2ea8222299f19000026': 0, '4f8dd2eb8222299f19000027': 0, '4f8dd2ec8222299f19000028': 0, '4f8dd2ed8222299f19000029': 0, '4f8dd2ee8222299f1900002a': 0, '4f8dd2ef8222299f1900002b': 0, '4f8dd2ef8222299f1900002c': 0, '4f8dd2f08222299f1900002d': 0, '4f8dd2f18222299f1900002e': 0, '4f8dd2f28222299f1900002f': 0, '4f8dd2f38222299f19000030': 0, '4f8dd2f48222299f19000031': 0, '4f8dd2f48222299f19000032': 0, '4f8dd2f58222299f19000033': 0, '4f8dd2f68222299f19000034': 0, '4f8dd2f78222299f19000035': 0, '4f8dd2f88222299f19000036': 0, '4f8dd2f98222299f19000037': 0, '4f8dd2f98222299f19000038': 0, '4f8dd2fa8222299f19000039': 0, '4f8dd2fb8222299f1900003a': 0, '4f8dd2fc8222299f1900003b': 0, '4f8dd2fd8222299f1900003c': 0, '4f8dd2fe8222299f1900003d': 0, '4f8dd2ff8222299f1900003e': 0, '4f8dd3008222299f1900003f': 0, '4f8dd3008222299f19000040': 0, '4f9b152f477b5e7d2a001ce6': 1, '4f9e349e2a198b3138000db4': 1, '4f9e3b5b2a198b3138000dca': 1, '4f9ed19d2a198b3138000ecb': 1, '4f9ed6122a198b3138000edd': 1, '4f9eda542a198b3138000ef2': 3, '4f9ee28c2a198b3138000f2c': 3, '4f9eebdc2a198b3138000fa6': 1, '4f9eedde2a198b3138000fd4': 1, '4f9ef4a82a198b3138001043': 1, '4f9ef7352a198b313800108d': 2, '4f9ef8c52a198b31380010af': 1, '4f9efd112a198b31380010c9': 1, '4f9efdb12a198b31380010cd': 1, '4f9efe0e2a198b31380010d6': 1, '4f9eff4e2a198b31380010ed': 3, '4f9effee2a198b31380010fb': 5, '4f9f009f2a198b3138001105': 1, '4f9f02da2a198b313800111e': 1, '4f9f047a2a198b3138001142': 1, '4f9f05542a198b313800114f': 1, '4f9f05c42a198b3138001158': 2, '4f9f07652a198b313800119d': 1, '4f9f09892a198b31380011df': 2, '4f9f0ae22a198b3138001223': 1, '4f9f0af22a198b3138001224': 1, '4f9f0c452a198b3138001231': 2, '4f9f0e4f2a198b3138001246': 1, '4f9f155f2a198b31380012a7': 3, '4f9f16e52a198b31380012e6': 1, '4f9f1aaa2a198b3138001332': 1, '4f9f1c2e2a198b3138001353': 2, '4f9f1d382a198b3138001378': 1, '4f9f80262a198b3138001b3f': 2, '4f9f82412a198b3138001ba1': 3, '4fa02c2f65d8861544000039': 1, '4fa0338d65d8861544000112': 1, '4fa038e965d88615440001f0': 2, '4fa04a2465d88615440002cf': 1, '4fa04c4565d88615440002fc': 1, '4fa04f0865d886154400032e': 1, '4fa050dd65d886154400036a': 1, '4fa054a965d88615440004ed': 1, '4fa0552265d8861544000532': 0, '4fa058ad65d88615440007b4': 1, '4fa05aec65d88615440008ea': 2, '4fa2013f65d8861544002506': 0, '4fa2015e65d8861544002509': 0, '4fa2f46b1a063d9309000128': 0, '4fa2f4721a063d9309000130': 0, '4fa2f48a1a063d9309000149': 0, '4fa965f32f304aa60a00e9b2': 50}

api.db.collection("course").findOne _id: new api.ObjectId("4f78e9a5e6ef81971e000001"), (err, course) =>
    
    course.nuggets.forEach (nugget) =>
        nuggetprobes[nugget._id] = (probe._id.toString() for probe in (nugget.probeset or []))
        # nuggetpoints[nugget._id] = 0
        # nugget.probeset.forEach (probe) =>
        #     id = probe._id.toString()
        #     if id.length isnt 24
        #         console.log id.length, id, typeof id
        #         return
        #     api.db.collection("probe").findOne _id: new api.ObjectId(id), (err, fullprobe) =>
        #         fullprobe.answers.forEach (answer) =>
        #             nuggetpoints[nugget._id] += answer.correct or 0


# printPoints = =>
#     console.log nuggetpoints

# setTimeout printPoints, 15000

    undergrads.forEach reset_user_midterm
    # undergrads.forEach compare_points

# compare_points = (email) =>
#     analytics.get_student_nugget_attempts email, (err, claimednuggets) =>
#         if err
#             console.log "Error getting stats for", email, err
#             return
        
#         totalclaimedpoints = 0
#         totalnugpoints = 0
#         claimednuggets.forEach (nugget) =>
#             nugpoints = nuggetpoints[nugget._id]
#             totalnugpoints += nugpoints
#             claimedpoints = nugget.points
#             totalclaimedpoints += claimedpoints
            
#             # if nugpoints != claimedpoints
#             #     console.log nugget._id, nugpoints, claimedpoints, email
        
#         if totalnugpoints > totalclaimedpoints
#             console.log totalnugpoints - totalclaimedpoints, email
        

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
        
