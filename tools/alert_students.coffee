auth = require("../auth.coffee")
emailer = require("../api/email.coffee")

qqqe = ["naltimim@ucsd.edu", "aamodei@ucsd.edu", "latkins@ucsd.edu", "aauyeung@ucsd.edu", "mawasthi@ucsd.edu", "ebarney@ucsd.edu", "tbarnsto@ucsd.edu", "cjbarton@ucsd.edu", "sbijanpo@ucsd.edu", "e1bloom@ucsd.edu", "nbonanno@ucsd.edu", "dbseiso@ucsd.edu", "jcalais@ucsd.edu", "svcampos@ucsd.edu", "kcarrasc@ucsd.edu", "joc013@ucsd.edu", "vwchang@ucsd.edu", "wachao@ucsd.edu", "ayc011@ucsd.edu", "lwchen@ucsd.edu", "rlc001@ucsd.edu", "lwc001@ucsd.edu", "jwc025@ucsd.edu", "gchuck@ucsd.edu", "jcoss@ucsd.edu", "ocostanz@ucsd.edu", "tcranfor@ucsd.edu", "rccuella@ucsd.edu", "rcusing@ucsd.edu", "sdangelo@ucsd.edu", "jldejesu@ucsd.edu", "jdefalco@ucsd.edu", "mdejosep@ucsd.edu", "radeng@ucsd.edu", "bdhaliwa@ucsd.edu", "gsdhillo@ucsd.edu", "jjdiamon@ucsd.edu", "tdomingo@ucsd.edu", "ccduong@ucsd.edu", "l2duong@ucsd.edu", "amfreema@ucsd.edu", "jgarafal@ucsd.edu", "vngarcia@ucsd.edu", "rgosavi@ucsd.edu", "cgov@ucsd.edu", "vaguerre@ucsd.edu", "mgumina@ucsd.edu", "pguzman@ucsd.edu", "csha@ucsd.edu", "kjhaley@ucsd.edu", "hnhall@ucsd.edu", "nhalstea@ucsd.edu", "sharihar@ucsd.edu", "crharmon@ucsd.edu", "aheredic@ucsd.edu", "jherzber@ucsd.edu", "tahirota@ucsd.edu", "tbhoang@ucsd.edu", "vkhollin@ucsd.edu", "sfhoward@ucsd.edu", "jyhsi@ucsd.edu", "eehsieh@ucsd.edu", "joh006@ucsd.edu", "thuezo@ucsd.edu", "aphunter@ucsd.edu", "rihu@ucsd.edu", "nishiko@ucsd.edu", "cjameson@ucsd.edu", "akamgarp@ucsd.edu", "nskanani@ucsd.edu", "myk009@ucsd.edu", "rkedlaya@ucsd.edu", "emk005@ucsd.edu", "hhk007@ucsd.edu", "dkrishna@ucsd.edu", "lakumar@ucsd.edu", "rolam@ucsd.edu", "a4lau@ucsd.edu", "klavi@ucsd.edu", "abl004@ucsd.edu", "c7le@ucsd.edu", "jnl004@ucsd.edu", "ttl018@ucsd.edu", "tlederge@ucsd.edu", "erl004@ucsd.edu", "jhl054@ucsd.edu", "sol015@ucsd.edu", "jil066@ucsd.edu", "chl159@ucsd.edu", "t9lin@ucsd.edu", "clinsche@ucsd.edu", "mcliu@ucsd.edu", "tsliu@ucsd.edu", "slunardi@ucsd.edu", "elundste@ucsd.edu", "siluong@ucsd.edu", "amacari@ucsd.edu", "cmagana@ucsd.edu", "lmai@ucsd.edu", "smandavg@ucsd.edu", "smannino@ucsd.edu", "kmanveli@ucsd.edu", "jcmcelfr@ucsd.edu", "elmeltze@ucsd.edu", "ntmercer@ucsd.edu", "ametzler@ucsd.edu", "jmeyers@ucsd.edu", "smezher@ucsd.edu", "kmiu@ucsd.edu", "e3moon@ucsd.edu", "rnassimi@ucsd.edu", "sneugros@ucsd.edu", "qpnguyen@ucsd.edu", "tbn006@ucsd.edu", "tbn004@ucsd.edu", "tin006@ucsd.edu", "nnocum@ucsd.edu", "aknoda@ucsd.edu", "asobrien@ucsd.edu", "rmohara@ucsd.edu", "aworr@ucsd.edu", "aoveroye@ucsd.edu", "apainter@ucsd.edu", "apatil@ucsd.edu", "jperches@ucsd.edu", "kapeterk@ucsd.edu", "spetit@ucsd.edu", "nppham@ucsd.edu", "adphuong@ucsd.edu", "raportil@ucsd.edu", "fqafiti@ucsd.edu", "qquarles@ucsd.edu", "kmquigle@ucsd.edu", "creuter@ucsd.edu", "earivera@ucsd.edu", "grorem@ucsd.edu", "krosendo@ucsd.edu", "rsablove@ucsd.edu", "asaini@ucsd.edu", "lrsakata@ucsd.edu", "psamermi@ucsd.edu", "ssamples@ucsd.edu", "d2scott@ucsd.edu", "eseubert@ucsd.edu", "ksharma@ucsd.edu", "m8shin@ucsd.edu", "isimpelo@ucsd.edu", "lesolano@ucsd.edu", "v1solis@ucsd.edu", "wstahl@ucsd.edu", "csubrahm@ucsd.edu", "psukaviv@ucsd.edu", "jrsyang@ucsd.edu", "gtalan@ucsd.edu", "rtalia@ucsd.edu", "bltang@ucsd.edu", "dtang@ucsd.edu", "dttran@ucsd.edu", "jet004@ucsd.edu", "a1tse@ucsd.edu", "emtse@ucsd.edu", "etuma@ucsd.edu", "alturner@ucsd.edu", "mudo@ucsd.edu", "mrvargas@ucsd.edu", "jvillads@ucsd.edu", "mwedeen@ucsd.edu", "nawells@ucsd.edu", "mrwestfa@ucsd.edu", "jcw020@ucsd.edu", "k8wong@ucsd.edu", "elyang@ucsd.edu", "gtyang@ucsd.edu", "v2yu@ucsd.edu"]

students = ['jamalex@gmail.com', "jdalexan@ucsd.edu"]

gradstudents = ["asalexan@ucsd.edu","kblackst@ucsd.edu","kbolden@ucsd.edu","sdeanda@ucsd.edu","djfrost@ucsd.edu","krhendri@ucsd.edu","minfante@ucsd.edu","nkucukbo@ucsd.edu","sbmacken@ucsd.edu","anair@ucsd.edu","vipatt@ucsd.edu","m1robled@ucsd.edu","ajschork@ucsd.edu","rtibbles@ucsd.edu","e1walker@ucsd.edu","cdance@ucsd.edu"]

undergrads = ["naltimim@ucsd.edu","aamodei@ucsd.edu","latkins@ucsd.edu","aauyeung@ucsd.edu","mawasthi@ucsd.edu","ebarney@ucsd.edu","tbarnsto@ucsd.edu","cjbarton@ucsd.edu","sbijanpo@ucsd.edu","e1bloom@ucsd.edu","nbonanno@ucsd.edu","dbseiso@ucsd.edu","jcalais@ucsd.edu","svcampos@ucsd.edu","kcarrasc@ucsd.edu","amchambe@ucsd.edu","joc013@ucsd.edu","vwchang@ucsd.edu","wachao@ucsd.edu","ayc011@ucsd.edu","lwchen@ucsd.edu","rlc001@ucsd.edu","lwc001@ucsd.edu","yhc001@ucsd.edu","jwc025@ucsd.edu","gchuck@ucsd.edu","jcoss@ucsd.edu","ocostanz@ucsd.edu","tcranfor@ucsd.edu","rccuella@ucsd.edu","rcusing@ucsd.edu","sdangelo@ucsd.edu","jldejesu@ucsd.edu","jdefalco@ucsd.edu","mdejosep@ucsd.edu","bdhaliwa@ucsd.edu","gsdhillo@ucsd.edu","jjdiamon@ucsd.edu","tdomingo@ucsd.edu","ccduong@ucsd.edu","l2duong@ucsd.edu","amfreema@ucsd.edu","jgarafal@ucsd.edu","vngarcia@ucsd.edu","rgosavi@ucsd.edu","cgov@ucsd.edu","vaguerre@ucsd.edu","mgumina@ucsd.edu","pguzman@ucsd.edu","csha@ucsd.edu","kjhaley@ucsd.edu","hnhall@ucsd.edu","nhalstea@ucsd.edu","sharihar@ucsd.edu","crharmon@ucsd.edu","aheredic@ucsd.edu","jherzber@ucsd.edu","tahirota@ucsd.edu","tbhoang@ucsd.edu","vkhollin@ucsd.edu","sfhoward@ucsd.edu","jyhsi@ucsd.edu","eehsieh@ucsd.edu","thuezo@ucsd.edu","aphunter@ucsd.edu","rihu@ucsd.edu","nishiko@ucsd.edu","cjameson@ucsd.edu","akamgarp@ucsd.edu","nskanani@ucsd.edu","myk009@ucsd.edu","rkedlaya@ucsd.edu","emk005@ucsd.edu","hhk007@ucsd.edu","dkrishna@ucsd.edu","lakumar@ucsd.edu","rolam@ucsd.edu","a4lau@ucsd.edu","klavi@ucsd.edu","abl004@ucsd.edu","c7le@ucsd.edu","jnl004@ucsd.edu","ttl018@ucsd.edu","tlederge@ucsd.edu","erl004@ucsd.edu","jhl054@ucsd.edu","sol015@ucsd.edu","jil066@ucsd.edu","chl159@ucsd.edu","t9lin@ucsd.edu","clinsche@ucsd.edu","mcliu@ucsd.edu","tsliu@ucsd.edu","slunardi@ucsd.edu","elundste@ucsd.edu","siluong@ucsd.edu","amacari@ucsd.edu","cmagana@ucsd.edu","lmai@ucsd.edu","smandavg@ucsd.edu","smannino@ucsd.edu","kmanveli@ucsd.edu","jcmcelfr@ucsd.edu","elmeltze@ucsd.edu","ntmercer@ucsd.edu","ametzler@ucsd.edu","jmeyers@ucsd.edu","smezher@ucsd.edu","kmiu@ucsd.edu","e3moon@ucsd.edu","rnassimi@ucsd.edu","sneugros@ucsd.edu","qpnguyen@ucsd.edu","tbn006@ucsd.edu","tbn004@ucsd.edu","tin006@ucsd.edu","nnocum@ucsd.edu","aknoda@ucsd.edu","asobrien@ucsd.edu","rmohara@ucsd.edu","aworr@ucsd.edu","aoveroye@ucsd.edu","apainter@ucsd.edu","apatil@ucsd.edu","jperches@ucsd.edu","kapeterk@ucsd.edu","spetit@ucsd.edu","nppham@ucsd.edu","adphuong@ucsd.edu","raportil@ucsd.edu","fqafiti@ucsd.edu","qquarles@ucsd.edu","kmquigle@ucsd.edu","creuter@ucsd.edu","earivera@ucsd.edu","grorem@ucsd.edu","krosendo@ucsd.edu","rsablove@ucsd.edu","asaini@ucsd.edu","lrsakata@ucsd.edu","psamermi@ucsd.edu","ssamples@ucsd.edu","d2scott@ucsd.edu","eseubert@ucsd.edu","m8shin@ucsd.edu","isimpelo@ucsd.edu","lesolano@ucsd.edu","v1solis@ucsd.edu","wstahl@ucsd.edu","csubrahm@ucsd.edu","psukaviv@ucsd.edu","jrsyang@ucsd.edu","gtalan@ucsd.edu","rtalia@ucsd.edu","bltang@ucsd.edu","dtang@ucsd.edu","dttran@ucsd.edu","jet004@ucsd.edu","a1tse@ucsd.edu","emtse@ucsd.edu","etuma@ucsd.edu","alturner@ucsd.edu","mudo@ucsd.edu","mrvargas@ucsd.edu","jvillads@ucsd.edu","mwedeen@ucsd.edu","nawells@ucsd.edu","mrwestfa@ucsd.edu","jcw020@ucsd.edu","k8wong@ucsd.edu","elyang@ucsd.edu","gtyang@ucsd.edu","v2yu@ucsd.edu"]

midtermgradeboundaries = [180,160,150,140,0]

grades = ['A','B','C','D','F']    

users = []
user_count = 0
api.db.collection('user').find().each (err, user) =>
    if err then return users.push email: user.email, _id: user._id, claimed: [], attempted: [], _error: err.toString()
    if not user?.email then return
    user_count++
    get_student_nugget_attempts user.email, (err, claimed, attempted) =>
        get_student_probe_scores user.email, (err, correct, incorrect) =>
            users.push email: user.email, _id: user._id, claimed: claimed, attempted: attempted, correct: correct, incorrect: incorrect, percent: Math.round(100 * correct / (correct + incorrect))
            users.push points: sum(nugget.points for nugget in claimed)

users = (user for user in users when user.email in undergrads)

users.forEach (student) => 
    
    grade = grades[(points>=x for x in midtermgradeboundaries).indexOf(true)]    
    
    body = """
        Dear student,

        As you are no doubt aware, the content of your Midterm and Final exams are determined entirely by your activity on the course website. As such, the grade you can achieve on your Midterm will be greatly affected by the number of points you have accrued while claiming nuggets.

        You are receiving this email to inform you of your current standing, and the maximum grade that you will be able to achieve in your Midterm exam.

        Total points for nuggets claimed so far: #{points}
        
        If you answer all of these questions correctly on the exam, you will get a grade of #{grade} on your Midterm exam.
        
        Remember, the grade you receive on the midterm is determined by the number of points you answer correctly on the exam. You will get one point for every correct answer (including partial credit for questions) - however, selecting too many answers will be penalized.
        
        On the day of the test, questions from any nuggets you have claimed will appear on your midterm exam. If you have claimed nuggets that you do not wish to appear on your midterm exam, please use the 'Unclaim' feature - this button can be found on the page for the particular nugget you wish to unclaim.
        
        As a reminder, these are the points totals you need to correctly answer on your Midterm exam for different grades:
        
        180+ - A
        
        160-179 - B
        
        150-159 - C
        
        140 - 149 - D

        Sincerely,
        Your instructors.
        """
    
    emailer.send TextBody: body, To: student.email, Subject: "Midterm Maximum Projected Grade", =>
        console.log "Email sent to", student.email
    
    