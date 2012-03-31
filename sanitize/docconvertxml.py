from bs4 import BeautifulSoup
import re

filename = ''

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
    if i:
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
    if i:
        htmlout+=html+'">'+x+'</p>'
    else:
        htmlout+=html+'">'+x+'</h3>'