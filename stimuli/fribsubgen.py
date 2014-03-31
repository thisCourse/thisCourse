import glob
import os
import re

names = {'fa1': 'tapo', 'fa2': 'sogi', 'fa3': 'keza', 'fa4': 'goru', 'fb1': 'fipo', 'fb2': 'bati', 'fb3': 'loro', 'fb4': 'mavu', 'fc1': 'duva', 'fc2': 'wopi', 'fc3': 'jaru', 'fc4': 'zila'}

subdirs = ['/examples', '/distractors', '/tests']

path = 'fribblessub/'

exampletesta = re.compile("_1[1-3]{1}2[1-3]{1}\.png")

exampletestb = re.compile("_2[1-3]{1}3[1-3]{1}\.png")

distractors = re.compile("_([23]{1}[1-3]{1}2|1[1-3]{1}3|[13]{1}[1-3]{1}3|2[1-3]{1}2)[1-3]{1}\.png")

def copyfiles(sources, target):
    for file in sources:
        os.system("cp " + file + " " + target)

for dir in glob.glob("/home/richard/Documents/UCSD/Online_Learning_Affect/Fribbles/allfribbles/*"):
    species = dir.split("/")[-1].lower()
    foldername = species + "." + names[species]
    os.mkdir(path + foldername)
    for sub in subdirs:
        os.mkdir(path + foldername + sub)
    files = glob.glob(dir + '/web/*')
    exampletestone = [file for file in files if exampletesta.search(file)]
    exampletesttwo = [file for file in files if exampletestb.search(file)]
    distractorfiles = [file for file in files if distractors.search(file)]
    examplefiles = exampletestone[0:5] + exampletesttwo[0:5]
    testfiles = exampletestone[5:] + exampletesttwo[5:]
    copyfiles(distractorfiles, path + foldername + "/distractors/")
    copyfiles(examplefiles, path + foldername + "/examples/")
    copyfiles(testfiles, path + foldername + "/tests/")