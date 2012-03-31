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

    xmlstring.replace('<p:','<')
    xmlstring.replace('<a:','<')
    xmlstring.replace('</a','</')
    xmlstring.replace('</p','</')

    open(filename,'w').write(xmlstring)

    alphanum = re.compile('[a-zA-Z0-9]+')

    soup = BeautifulSoup(open(filename),'xml')

    htmlout = ''

    for i,x in enumerate(soup.findAll(text=alphanum)):
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
            glossy = 1
    return htmlout, glossy*gloss


slidesnotes = {}

for slide in glob.glob('*/slides/*.xml'):
    markup, glossary = htmlfromxml(slide)
    slidedict = {'html':markup,'glossary':glossary}
    slidekey = slide.split('/')[0]+slide.split('.')[0].split('/')[2]
    slidesnotes[slidekey] = slidedict