auth = require("../auth.coffee")
crypto = require("crypto")
emailer = require("../api/email.coffee")

qqqe = ["naltimim@ucsd.edu", "aamodei@ucsd.edu", "latkins@ucsd.edu", "aauyeung@ucsd.edu", "mawasthi@ucsd.edu", "ebarney@ucsd.edu", "tbarnsto@ucsd.edu", "cjbarton@ucsd.edu", "sbijanpo@ucsd.edu", "e1bloom@ucsd.edu", "nbonanno@ucsd.edu", "dbseiso@ucsd.edu", "jcalais@ucsd.edu", "svcampos@ucsd.edu", "kcarrasc@ucsd.edu", "joc013@ucsd.edu", "vwchang@ucsd.edu", "wachao@ucsd.edu", "ayc011@ucsd.edu", "lwchen@ucsd.edu", "rlc001@ucsd.edu", "lwc001@ucsd.edu", "jwc025@ucsd.edu", "gchuck@ucsd.edu", "jcoss@ucsd.edu", "ocostanz@ucsd.edu", "tcranfor@ucsd.edu", "rccuella@ucsd.edu", "rcusing@ucsd.edu", "sdangelo@ucsd.edu", "jldejesu@ucsd.edu", "jdefalco@ucsd.edu", "mdejosep@ucsd.edu", "radeng@ucsd.edu", "bdhaliwa@ucsd.edu", "gsdhillo@ucsd.edu", "jjdiamon@ucsd.edu", "tdomingo@ucsd.edu", "ccduong@ucsd.edu", "l2duong@ucsd.edu", "amfreema@ucsd.edu", "jgarafal@ucsd.edu", "vngarcia@ucsd.edu", "rgosavi@ucsd.edu", "cgov@ucsd.edu", "vaguerre@ucsd.edu", "mgumina@ucsd.edu", "pguzman@ucsd.edu", "csha@ucsd.edu", "kjhaley@ucsd.edu", "hnhall@ucsd.edu", "nhalstea@ucsd.edu", "sharihar@ucsd.edu", "crharmon@ucsd.edu", "aheredic@ucsd.edu", "jherzber@ucsd.edu", "tahirota@ucsd.edu", "tbhoang@ucsd.edu", "vkhollin@ucsd.edu", "sfhoward@ucsd.edu", "jyhsi@ucsd.edu", "eehsieh@ucsd.edu", "joh006@ucsd.edu", "thuezo@ucsd.edu", "aphunter@ucsd.edu", "rihu@ucsd.edu", "nishiko@ucsd.edu", "cjameson@ucsd.edu", "akamgarp@ucsd.edu", "nskanani@ucsd.edu", "myk009@ucsd.edu", "rkedlaya@ucsd.edu", "emk005@ucsd.edu", "hhk007@ucsd.edu", "dkrishna@ucsd.edu", "lakumar@ucsd.edu", "rolam@ucsd.edu", "a4lau@ucsd.edu", "klavi@ucsd.edu", "abl004@ucsd.edu", "c7le@ucsd.edu", "jnl004@ucsd.edu", "ttl018@ucsd.edu", "tlederge@ucsd.edu", "erl004@ucsd.edu", "jhl054@ucsd.edu", "sol015@ucsd.edu", "jil066@ucsd.edu", "chl159@ucsd.edu", "t9lin@ucsd.edu", "clinsche@ucsd.edu", "mcliu@ucsd.edu", "tsliu@ucsd.edu", "slunardi@ucsd.edu", "elundste@ucsd.edu", "siluong@ucsd.edu", "amacari@ucsd.edu", "cmagana@ucsd.edu", "lmai@ucsd.edu", "smandavg@ucsd.edu", "smannino@ucsd.edu", "kmanveli@ucsd.edu", "jcmcelfr@ucsd.edu", "elmeltze@ucsd.edu", "ntmercer@ucsd.edu", "ametzler@ucsd.edu", "jmeyers@ucsd.edu", "smezher@ucsd.edu", "kmiu@ucsd.edu", "e3moon@ucsd.edu", "rnassimi@ucsd.edu", "sneugros@ucsd.edu", "qpnguyen@ucsd.edu", "tbn006@ucsd.edu", "tbn004@ucsd.edu", "tin006@ucsd.edu", "nnocum@ucsd.edu", "aknoda@ucsd.edu", "asobrien@ucsd.edu", "rmohara@ucsd.edu", "aworr@ucsd.edu", "aoveroye@ucsd.edu", "apainter@ucsd.edu", "apatil@ucsd.edu", "jperches@ucsd.edu", "kapeterk@ucsd.edu", "spetit@ucsd.edu", "nppham@ucsd.edu", "adphuong@ucsd.edu", "raportil@ucsd.edu", "fqafiti@ucsd.edu", "qquarles@ucsd.edu", "kmquigle@ucsd.edu", "creuter@ucsd.edu", "earivera@ucsd.edu", "grorem@ucsd.edu", "krosendo@ucsd.edu", "rsablove@ucsd.edu", "asaini@ucsd.edu", "lrsakata@ucsd.edu", "psamermi@ucsd.edu", "ssamples@ucsd.edu", "d2scott@ucsd.edu", "eseubert@ucsd.edu", "ksharma@ucsd.edu", "m8shin@ucsd.edu", "isimpelo@ucsd.edu", "lesolano@ucsd.edu", "v1solis@ucsd.edu", "wstahl@ucsd.edu", "csubrahm@ucsd.edu", "psukaviv@ucsd.edu", "jrsyang@ucsd.edu", "gtalan@ucsd.edu", "rtalia@ucsd.edu", "bltang@ucsd.edu", "dtang@ucsd.edu", "dttran@ucsd.edu", "jet004@ucsd.edu", "a1tse@ucsd.edu", "emtse@ucsd.edu", "etuma@ucsd.edu", "alturner@ucsd.edu", "mudo@ucsd.edu", "mrvargas@ucsd.edu", "jvillads@ucsd.edu", "mwedeen@ucsd.edu", "nawells@ucsd.edu", "mrwestfa@ucsd.edu", "jcw020@ucsd.edu", "k8wong@ucsd.edu", "elyang@ucsd.edu", "gtyang@ucsd.edu", "v2yu@ucsd.edu"]

students = ['jamalex@gmail.com', "jdalexan@ucsd.edu", "rtibbles@ucsd.edu"]

students.forEach (email) => 
    shasum = crypto.createHash('sha1')
    shasum.update(email)
    password = shasum.digest("hex").slice(5,13)
    auth.create_user email, password, => console.log "User successfully created:", email, "(password:", password + ")"        
    body = """
        Dear student,

        Welcome to COGS107C! We've created an account for you to login to the website. For now, we've chosen a password for you, but later you'll be able to change it to your own password.

        Email: #{email}
        Password: #{password}

        The website is at: http://cogs107c.thiscourse.com/course/

        Please let us know if you have any troubles logging in. The link for the pretest will be sent to you later tonight.

        Sincerely,
        Your instructors.
        """
    
    emailer.send TextBody: body, To: email, Subject: "Welcome to COGS107C! (login details inside)", =>
        console.log "Email sent to", email
    
    