import glob
import os
import json

def createHash(item):
    hash = 0
    if len(item) == 0:
        return hash
    for char in item:
        hash = ((hash <<5) - hash) + ord(char)
    return hex(hash)[-13:-1]

traininglist = []

imgpath = "<img src='/static/images/stimuli/%s.png' class='stimulus'>"

for dir in glob.glob("fribblessub/*"):
    exemplar = "<p class='title'>" + dir.split('/')[1].split('.')[1] + "</p>"
    distractorfiles = glob.glob(dir+"/distractors/*.png")
    examplefiles = (glob.glob(dir+"/examples/*.png"))
    testfiles = (glob.glob(dir+"/tests/*.png"))
    files = distractorfiles + examplefiles + testfiles
    distractorhash = [createHash(distractor) for distractor in distractorfiles]
    examplehash = [createHash(example) for example in examplefiles]
    testhash = [createHash(test) for test in testfiles]
    hashes = distractorhash + examplehash + testhash
    distractors = [imgpath % distractor for distractor in distractorhash]
    examples = [imgpath % example for example in examplehash]
    tests = [imgpath % test for test in testhash]
    training = { "exemplar": exemplar, "distractors": distractors, "examples": examples, "tests": tests}
    traininglist.append(training)
    for i, file in enumerate(files):
        os.system("cp " + file + " ../public/images/stimuli/%s.png" % hashes[i])



trainingout = "module.export = " + json.dumps(traininglist)

trainingfile = open('../tools/fribblessub.coffee','w')

trainingfile.write(trainingout)

trainingfile.close()