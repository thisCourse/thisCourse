_ = require("underscore")
async = require("async")
analytics = require("../api/analytics")
api = require("../api/api")
redis = require("redis").createClient()

undergrads = ['jabramcz@ucsd.edu', 'ejahmad@ucsd.edu', 'arahmed@ucsd.edu', 'kalbrech@ucsd.edu', 'sarbiv@ucsd.edu', 'parguell@ucsd.edu', 'abarthur@ucsd.edu', 'tashcraf@ucsd.edu', 'sasuncio@ucsd.edu', 'aathwal@ucsd.edu', 'eaverbuk@ucsd.edu', 'navunjia@ucsd.edu', 'pbangalo@ucsd.edu', 'mfbanh@ucsd.edu', 'cbarrios@ucsd.edu', 'djbarth@ucsd.edu', 'ebenko@ucsd.edu', 'mberkebi@ucsd.edu', 'lberrios@ucsd.edu', 'ccbetts@ucsd.edu', 'adbrewer@ucsd.edu', 'abriones@ucsd.edu', 'kmbrooks@ucsd.edu', 'fbulacan@ucsd.edu', 'bcai@ucsd.edu', 'ccarball@ucsd.edu', 'kacarmic@ucsd.edu', 'lchavess@ucsd.edu', 'ncharik@ucsd.edu', 'rcho@ucsd.edu', 'nkchowdh@ucsd.edu', 'cecisner@ucsd.edu', 'ccordos@ucsd.edu', 'xcruzoca@ucsd.edu', 'jmdarlin@ucsd.edu', 'cdelcid@ucsd.edu', 'radeng@ucsd.edu', 'dcdiaz@ucsd.edu', 'rdiega@ucsd.edu', 'adien@ucsd.edu', 'mdifley@ucsd.edu', 'shdo@ucsd.edu', 'jdraper@ucsd.edu', 'edroge@ucsd.edu', 'bcdunn@ucsd.edu', 'leberle@ucsd.edu', 'sehly@ucsd.edu', 'gelezra@ucsd.edu', 'veestrad@ucsd.edu', 'petebari@ucsd.edu', 'bfan@ucsd.edu', 'rjfarjad@ucsd.edu', 'mflorend@ucsd.edu', 'dfluster@ucsd.edu', 'ahfung@ucsd.edu', 'bgalet@ucsd.edu', 'agasperi@ucsd.edu', 'fgaul@ucsd.edu', 'mgerega@ucsd.edu', 'kgevorki@ucsd.edu', 'nsgibbs@ucsd.edu', 'sglobe@ucsd.edu', 'sogonzal@ucsd.edu', 'pgoodric@ucsd.edu', 'sgroff@ucsd.edu', 'kguo@ucsd.edu', 'chakakia@ucsd.edu', 'lhamant@ucsd.edu', 'zharirch@ucsd.edu', 'cheil@ucsd.edu', 'nahemsle@ucsd.edu', 'ahermer@ucsd.edu', 'jhernand@ucsd.edu', 'chirahar@ucsd.edu', 'khitchen@ucsd.edu', 'ayhuffma@ucsd.edu', 'chyde@ucsd.edu', 'kcinocen@ucsd.edu', 'djoy@ucsd.edu', 'ckamson@ucsd.edu', 'ekhalsa@ucsd.edu', 'askhuran@ucsd.edu', 'rkilbury@ucsd.edu', 'gkirkish@ucsd.edu', 'pkirwin@ucsd.edu', 'kyoungki@ucsd.edu', 'gkono@ucsd.edu', 'ykotturi@ucsd.edu', 'ckushner@ucsd.edu', 'cklam@ucsd.edu', 'vlamanuz@ucsd.edu', 'ablatta@ucsd.edu', 'colaw@ucsd.edu', 'cile@ucsd.edu', 'pale@ucsd.edu', 'alecce@ucsd.edu', 'eleija@ucsd.edu', 'dwleung@ucsd.edu', 'jslevin@ucsd.edu', 'aelock@ucsd.edu', 'lluers@ucsd.edu', 'kkmach@ucsd.edu', 'rmacpher@ucsd.edu', 'rimagana@ucsd.edu', 'jmagaria@ucsd.edu', 'amahrous@ucsd.edu', 'amajidi@ucsd.edu', 'imarkary@ucsd.edu', 'omartens@ucsd.edu', 'damaryan@ucsd.edu', 'ammcginn@ucsd.edu', 'phmcmaho@ucsd.edu', 'ldepaula@ucsd.edu', 'amesfin@ucsd.edu', 'dnmichae@ucsd.edu', 'jmiklask@ucsd.edu', 'limirand@ucsd.edu', 'smirth@ucsd.edu', 'rdmistry@ucsd.edu', 'ymohamma@ucsd.edu', 'lnmontan@ucsd.edu', 'pmoore@ucsd.edu', 'smoss@ucsd.edu', 'cmoy@ucsd.edu', 'bmurthy@ucsd.edu', 'rnakanot@ucsd.edu', 'nanarang@ucsd.edu', 'anatsuha@ucsd.edu', 'lneal@ucsd.edu', 'aneskovi@ucsd.edu', 'crolough@ucsd.edu', 'roceguer@ucsd.edu', 'nodowd@ucsd.edu', 'sokhovat@ucsd.edu', 'komori@ucsd.edu', 'oortizdu@ucsd.edu', 'toyakawa@ucsd.edu', 'ejpadill@ucsd.edu', 'spalache@ucsd.edu', 'jspalmer@ucsd.edu', 'depan@ucsd.edu', 'epapish@ucsd.edu', 'bpentek@ucsd.edu', 'rnperez@ucsd.edu', 'ewpeters@ucsd.edu', 'chphung@ucsd.edu', 'rprentis@ucsd.edu', 'jprotsma@ucsd.edu', 'heqiu@ucsd.edu', 'nhquach@ucsd.edu', 'mradillo@ucsd.edu', 'bragunto@ucsd.edu', 'jkrahman@ucsd.edu', 'drahmati@ucsd.edu', 'drazo@ucsd.edu', 'anreese@ucsd.edu', 'mreiderm@ucsd.edu', 'jrey@ucsd.edu', 'srick@ucsd.edu', 'jnrico@ucsd.edu', 'ndrogers@ucsd.edu', 'tfromero@ucsd.edu', 'mrosasjr@ucsd.edu', 'rroseman@ucsd.edu', 'srummel@ucsd.edu', 'srussick@ucsd.edu', 'awsaaved@ucsd.edu', 'ksalcine@ucsd.edu', 'rsaraswa@ucsd.edu', 'ssaturda@ucsd.edu', 'yjsaxena@ucsd.edu', 'msaysomp@ucsd.edu', 'heschmid@ucsd.edu', 'tsepulve@ucsd.edu', 'beshaikh@ucsd.edu', 'adshen@ucsd.edu', 'ashering@ucsd.edu', 'hshieh@ucsd.edu', 'lshook@ucsd.edu', 'rsirimit@ucsd.edu', 'hskarbov@ucsd.edu', 'gsoghoya@ucsd.edu', 'sysong@ucsd.edu', 'rsoohoo@ucsd.edu', 'eksteven@ucsd.edu', 'bstiller@ucsd.edu', 'tstoneho@ucsd.edu', 'astraus@ucsd.edu', 'cstakaha@ucsd.edu', 'htehrani@ucsd.edu', 'ato@ucsd.edu', 'astorres@ucsd.edu', 'aetran@ucsd.edu', 'atravagl@ucsd.edu', 'jtrees@ucsd.edu', 'ltribull@ucsd.edu', 'ruda@ucsd.edu', 'furibe@ucsd.edu', 'bvallabh@ucsd.edu', 'elvan@ucsd.edu', 'cvassos@ucsd.edu', 'vivoong@ucsd.edu', 'lpvu@ucsd.edu', 'rawalsh@ucsd.edu', 'mpwang@ucsd.edu', 'awattenb@ucsd.edu', 'emwhite@ucsd.edu', 'kwomack@ucsd.edu', 'btwong@ucsd.edu', 'jdwright@ucsd.edu', 'dywu@ucsd.edu', 'mwynn@ucsd.edu', 'stzapata@ucsd.edu', 'szerkle@ucsd.edu', 'zxzheng@ucsd.edu', 'dhzinn@ucsd.edu']

# undergrads = ['test']

probes = []

    
api.db.collection("course").findOne _id: new api.ObjectId("4f78e9a5e6ef81971e000001"), (err, course) =>
    
    for nugget in course.nuggets
        if nugget._id == "514df2ae400a59290a000054" then nougat = nugget
    
    nougat.probeset.forEach (probe) =>
        probes.push(probe._id.toString())

    console.log probes

    undergrads.forEach (email) =>
        console.log "Processing", email

        answered_key = "posttest-answered:" + email
        unanswered_key = "posttest-unanswered:" + email
        
        redis.del answered_key, unanswered_key, =>
            probes.forEach (probe) =>
                redis.lpush unanswered_key, probe
            console.log "completed", email
        

# for n in app.get("course").get("nuggets").models
#     if not n.get("title")
#         console.log JSON.stringify (p.id for p in n.get("probeset").models)
#         break


