from bs4 import BeautifulSoup, NavigableString
import re
import glob


alphanum = re.compile('[a-zA-Z0-9]+')

#bash commands for image conversion:

#ls *.wmf|xargs -I {} convert {} {}.png

#rename 's/\.wmf*//g' *.wmf.png
    

def htmlfromxml(filename,j=0):

    xmlfile = open(filename)

    xmlstring = xmlfile.read()

    xmlfile.close()

    xmlstring = xmlstring.replace('<p:','<')
    xmlstring = xmlstring.replace('<a:','<')
    xmlstring = xmlstring.replace('</a:','</')
    xmlstring = xmlstring.replace('</p:','</')
    xmlstring = xmlstring.replace('</:','</')

    open(filename,'w').write(xmlstring)

    soup = BeautifulSoup(open(filename),'xml')

    htmlout = ''
    
    glossed = False
    
    title = None
    
    xmljunk = ['14:hiddenLine>','14:hiddenFill>','style.visibility'] #hack to get rid of residual junk from xml processing
    
     
    for i,w in enumerate(soup.findAll(lambda tag: tag in list(set([x.parent.parent for x in soup.findAll(text=alphanum)])))):
    
        gloss = 0
        glossy = 0
        if i+j:
            htmlout += '<p>'
        else:
            htmlout += '<h3>'
         
        for x in w.findAll(text=alphanum):
            if x in xmljunk:
                None
            else:
                html = '<span style="'
                for y in x.parent.previous_siblings:
                    if y.has_key('b'):
                        if y['b']=='1':
                            html+='font-weight:bold;'
                    for z in y.findAll(lambda tag: tag.has_key('val')):
                        if z.has_key('val'):
                            html+='color:#'+z['val']
                            if z['val']=='0000FF':
                                gloss = 1
                htmlout+=html+'">'+x+'</span>'
        if i+j:
            htmlout += '</p>'
        else:
            htmlout += '</h3>'
            title = htmlout
            if gloss:
                glossed = True
    return htmlout, glossed, title

tagstrip = re.compile('<[^>]+>')

slides = {}
glossaryslides = {}

for slide in glob.glob('*/slides/*.xml'):
    markup, glossary,glossname = htmlfromxml(slide)
    slidekey = slide.split('/')[0]+slide.split('.')[0].split('/')[2]
    slidedict = {'html':markup}
    glossname = tagstrip.sub('',glossname)
    if glossary:
        glossaryslides[glossname]=slidedict
    slides[slidekey] = slidedict


lecnug = re.compile('(?P<lecture>L[0-9]+)\.(?P<cluster>C[0-9]+)\.(?P<nugget>N[0-9]+)\.(?P<subpage>[0-9]+)')

questsplit = 'L(?:<[^>]+>)*[0-9]+(?:<[^>]+>)*\.(?:<[^>]+>)*C(?:<[^>]+>)*[0-9]+(?:<[^>]+>)*\.(?:<[^>]+>)*N(?:<[^>]+>)*[0-9]+(?:<[^>]+>)*\.(?:<[^>]+>)*Q(?:<[^>]+>)*[0-9]+'

question = re.compile(questsplit)

paragraph = re.compile('<p[^>]*>.*?</p>')

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
            questkeys = question.findall(markup)
            nuggetqs = []
            for i,probe in enumerate(questlist[1:]):
                paras = paragraph.findall(probe)
                answers = []
                probequestion = tagstrip.sub('',paras[0])
                for para in paras[1:]:
                    answer = {}
                    if 'font-weight' in para:
                        answer['correct'] = True
                    answertext = tagstrip.sub('',para)
                    if len(answertext)>0:
                        answer['text'] = answertext
                        answers.append(answer)
                probedict = {'questiontext':probequestion,'answers':answers}
                probekey = tagstrip.sub('',questkeys[i]).replace('.','')
                questioncollection[probekey] = probedict
                nuggetqs.append(probekey)
            nuggetdict['probes']=nuggetqs
                
        if nuggetcollection.has_key(nuggetkey):
            nuggetcollection[nuggetkey] = dict(nuggetcollection[nuggetkey].items() + nuggetdict.items())
        else:
            nuggetcollection[nuggetkey] = nuggetdict
            
#Second pass for questions for Steve's slides:

for slide in glob.glob('*/notesSlides/*.xml'):
    markup, glossary, glossname = htmlfromxml(slide,j=1)
    questname = question.search(markup)
    if questname:
        questing = questname.group()
        nuggetkey = ''.join(questing.split('.')[:-1])
        slidekey = slide.split('/')[0]+slide.split('.')[0].split('/')[2].replace('notesS','s')
        if not questioncollection.has_key(questname.group().replace('.','')):
            probe = slides[slidekey]['html']
            paras = paragraph.findall(probe)
            answers = []
            probequestion = tagstrip.sub('',paras[0])
            for para in paras[1:]:
                answer = {}
                if 'font-weight' in para:
                    answer['correct'] = True
                answertext = tagstrip.sub('',para)
                if len(answertext)>0:
                    answer['text'] = answertext
                    answers.append(answer)
            probedict = {'questiontext':probequestion,'answers':answers}
            probekey = questing.replace('.','')
            questioncollection[probekey] = probedict
            if nuggetcollection[nuggetkey].has_key('probes'):
                nuggetcollection[nuggetkey]['probes'].append(probekey)
            else:
                nuggetcollection[nuggetkey]['probes'] = [probekey]
