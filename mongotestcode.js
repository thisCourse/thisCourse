{
    course: 17,
    title: "Intro to Cognitive Science",
    sections: [
        {
            type: "book",
            width: 6,
            items: [
                {
                    name: "Great book",
                    isbn: 7538223422,
                    image_url: "http://imgshack.com/myimg.png"
                },
                {
                    name: "Best book",
                    isbn: 7538766553,
                    image_url: "http://imgshack.com/bestbook.png"
                },
            ]
        },
        {
            type: "teacher",
            width: 12,
            items: [
                {
                    name: "Jamie Alexandre",
                    title: "TA",
                    office: "CSB223"
                },
                {
                    name: "Micah Bregman",
                    title: "Professor",
                    office: "CSB223"
                }
            ]
        }
    ]
}

{
    course: 1,
    title: "Intro to Cognitive Science",
    sections: [
        {
            type: "teacher",
            width: 12,
            items: [
                {
                    name: "Belle Tancioni",
                    title: "TA",
                    office: "CSB443"
                },
                {
                    name: "Jamie Alexandre",
                    title: "Professor",
                    office: "CSB223"
                }
            ]
        },
        {
            type: "book",
            width: 12,
            items: [
                {
                    name: "OK book",
                    isbn: 2346235712,
                    image_url: "http://imgshack.com/okbook.png"
                },
                {
                    name: "Bad book",
                    isbn: 2324872545,
                    image_url: "http://imgshack.com/badbook.png"
                },
                {
                    name: "Terrible book",
                    isbn: 2324872545,
                    image_url: "http://imgshack.com/badbook.png"
                }
            ]
        },
        {
            type: "schedule",
            width: 12,
            items: [
                {
                    date: new Date(991034523223),
                    topic: "Stuff to do in this class"
                },
                {
                    date: new Date(991094623223),
                    topic: "Final exam already!"
                }
            ]
        }
    ]
}


db.grades.find()

{
    course: OBJID,
    student: "joe@schmoe.com",
    scores: [
        {
            assignment: OBJID,
            score: 34
        },
        {
            assignment: OBJID,
            score: 98
        },
    ],
}

{
    course: OBJID,
    student: "joe@schmoe.com",
    scores: [
        {
            assignment: OBJID,
            score: 34,
            notes: "This was terrible."
        },
        {
            assignment: OBJID,
            score: 98,
            notes: "Getting better."
        },
    ],
}


for (var i=0; i<100000; i++) {

    var obj = {};
    obj.price = Math.random() * 300;
    obj.name = '';
    for (var j=0; j < 10; j++)
        obj.name += String.fromCharCode(97 + 26*Math.random());
    obj.stores = [];
    for (var j=0; j < 10; j++)
        if (Math.random() < 0.5) obj.stores.push(j);
    db.docs.save(obj);

}

