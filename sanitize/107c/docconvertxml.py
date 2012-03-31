from bs4 import BeautifulSoup
import re
import glob


#bash commands for image conversion:

#ls *.wmf|xargs -I {} convert {} {}.png

#rename 's/\.wmf*//g' *.wmf.png

def htmlfromxml(filename,j=0):

    xmlfile = open(filename)

    xmlstring = xmlfile.read()

    xmlfile.close()

    xmlstring = xmlstring.replace('<p:','<')
    xmlstring = xmlstring.replace('<a:','<')
    xmlstring = xmlstring.replace('</a','</')
    xmlstring = xmlstring.replace('</p','</')

    open(filename,'w').write(xmlstring)

    alphanum = re.compile('[a-zA-Z0-9]+')

    soup = BeautifulSoup(open(filename),'xml')

    htmlout = ''
    
    glossed = False
    
    glosstitle = None
    
    xmljunk = ['14:hiddenLine>','14:hiddenFill>'] #hack to get rid of residual junk from xml processing
    
    for i,x in enumerate(soup.findAll(text=alphanum)):
        if x in xmljunk:
            None
        else:
            gloss = 0
            glossy = 0
            if i+j:
                html = '<p style="'
            else:
                html = '<h3 style="'
            for y in x.parent.previous_siblings:
                for z in y.findAll(lambda tag: tag.has_key('val') or tag.has_key('b')):
                    if z.has_key('b'):
                        if z['b']=='1':
                            html+='font-weight:bold;'
                    if z.has_key('val'):
                        html+='color:#'+z['val']
                        if z['val']=='0000FF':
                            gloss = 1
            if i+j:
                htmlout+=html+'">'+x+'</p>'
            else:
                htmlout+=html+'">'+x+'</h3>'
                glossy = gloss
                glosstitle = x
            if glossy:
                glossed = True
    return htmlout, glossed, glosstitle


slides = {}
glossaryslides = {}

for slide in glob.glob('*/slides/*.xml'):
    markup, glossary,glossname = htmlfromxml(slide)
    slidekey = slide.split('/')[0]+slide.split('.')[0].split('/')[2]
    slidedict = {'html':markup}
    if glossary:
        glossaryslides[glossname]=slidedict
    slides[slidekey] = slidedict


lecnug = re.compile('(?P<lecture>L[0-9]+)\.(?P<cluster>C[0-9]+)\.(?P<nugget>N[0-9]+)\.(?P<subpage>[0-9]+)')

questsplit = 'L[0-9]+\.C[0-9]+\.N[0-9]+\.Q[0-9]+'

question = re.compile(questsplit)

paragraph = re.compile('<p[^<]*</p>')

questioncollection = {}

nuggetcollection = {}
    
for slide in glob.glob('*/notesSlides/*.xml'):
    markup, glossary, glossname = htmlfromxml(slide,j=1)
    questlist = re.split(questsplit,markup)
    finding = lecnug.search(questlist[0])
    slidekey = slide.split('/')[0]+slide.split('.')[0].split('/')[2].replace('notesS','s')
    
    if finding:
        tags = []
        lecture,cluster,nugget,subpage = finding.groups()
        nuggetkey = lecture+cluster+nugget
        nuggetdict = {}
        slidepage = 'page'+subpage
        nuggetdict[slidepage] = slides[slidekey]
        tagsection = lecnug.sub('',questlist[0])
        tagsoup = BeautifulSoup(tagsection)
        for tag in tagsoup.text.split(','):
            tags.append(tag)
        tags = tags + [lecture,cluster,nugget]
        nuggetdict['tags'] = tags
        if len(questlist)>1:
            nuggetqs = []
            for probe in questlist[1:]:
                if question.search(probe):
                    paras = paragraph.findall(probe)
                    answers = []
                    probequestion = paras[0]
                    for para in paras[1:]:
                        answer = {}
                        if para.find('font-weight'):
                            answer['correct'] = True
                        answer['text'] = para
                        answers.append(answer)
                    probedict = {'questiontext':probequestion,'answers':answers}
                    probekey = question.search(probe).group().replace('.','')
                    questioncollection[probekey] = probedict
                    nuggetqs.append(probekey)
                
        if nuggetcollection.has_key(nuggetkey):
            nuggetcollection[nuggetkey] = dict(nuggetcollection[nuggetkey].items() + nuggetdict.items())
        else:
            nuggetcollection[nuggetkey] = nuggetdict