 #!/usr/local/bin/python
 # coding: utf-8

import uno
from os.path import abspath
from com.sun.star.beans import PropertyValue
from bs4 import BeautifulSoup, Comment
import base64
import re
from sys import argv, exit
import imghdr
import commands
import glob


def openofficeconv(importfile):

	exportfile = importfile.split('.')[0] + '.html'

	importfileurl = uno.systemPathToFileUrl(abspath(importfile))

	exportfileurl = uno.systemPathToFileUrl(abspath(exportfile))

	filter = PropertyValue()
	filter.Name = "Hidden"
	filter.Value = True

	document = desktop.loadComponentFromURL(importfileurl,'_blank',0,tuple([filter]))


	filter = PropertyValue()
	filter.Name = "FilterName"
	filter.Value = "XHTML Impress File"


	document.storeToURL(exportfileurl, tuple([filter]))

	return exportfile


def removecomments(soup):
	#Remove comments

	comments = soup.findAll(text = lambda text:isinstance(text, Comment))

	[comment.extract() for comment in comments]


def imagedecode(filename, uri):

	data = uri.split(",")[1]

	filetype = uri.split(";")[0].split("/")[-1]

	result = base64.decodestring(data)

	if filetype=='*':
		if imghdr.what(None,result):
			filetype=imghdr.what(None,result)
		else:
			filetype=''

	fileid = filename + "." + filetype

	f = open(fileid, "w")
	f.write(result)
	f.close()
	return fileid


def imagestrip(soup,htmlname):
	#Save image URIs as images and change to links

	imagenamemod = '-image'

	images = soup.findAll('img')

	for num, image in enumerate(images):
		image["src"] = imagedecode(htmlname.split('/')[1].split(".")[0]+imagenamemod+str(num),image["src"])




def distributecss(soup):
	#Code to take CSS styling out of <style> header and distribute into HTML code

	groupre = re.compile('\.(?P<classname>[a-zA-Z0-9]+) \{(?P<styles>[-a-zA-Z0-9:;,#!% ]*)\}')

	styles = groupre.findall(soup.find('style').text)

	for style in styles:
		classname, styling = style
		for tag in soup.select('.'+classname):
			tag['style'] = styling

	#Remove style header

	soup.style.decompose()


def divremove(soup):

	#The cure for <div>itis

	#Preserve id information from divs that have it

	for div in soup.select('div[id]'):
		tag = soup.new_tag('nuggetslide')
		tag['id'] = div['id']
		div.insert_before(tag)


	while soup.div!=None:
		soup.div.replace_with_children()
		
	for div in soup.findAll('nuggetslide',id=re.compile("Picture")):
		div.replace_with_children()


def styleprune(soup,classname,style):
	for tag in [x for x in soup.select('[style]') if style in x['style']]:
		del tag['class']
		del tag['style']
		tag['class'] = classname


def stripempty(soup,tagname):
	for x in soup.findAll(lambda tag: tag.name == tagname and (tag.string is None or tag.string.strip()=="")):
		if x.replace_with_children()==x:
			x.decompose()

def stylelessspans(soup):
	for x in soup.findAll(lambda tag: tag.name =='span' and tag.get('style')==None):
		if x.replace_with_children()==x:
			x.decompose()

def onlychildlist(soup):
	for x in (soup.select('ol > li') + soup.select('ul > li')):
		siblingels = 0
		for sibs in x.previous_siblings:
			siblingels += hasattr(sibs,'name')
		for sibs in x.next_siblings:
			siblingels += hasattr(sibs,'name')
		if siblingels == 0:
			x.parent.replace_with_children()
			x.replace_with_children()


def removeblobs(htmlfile):
	fileopen = open(htmlfile)
	html = fileopen.read()
	fileopen.close()
	html = html.replace('•','')
 	open(htmlfile,'w').write(html)

if __name__ == "__main__":
    
    #OpenOffice Conversion - Requires OpenOffice instance running with server open at 2002 by default

	OODefaultPort = 2002

	localContext = uno.getComponentContext()

	resolver = localContext.ServiceManager.createInstanceWithContext(
					"com.sun.star.bridge.UnoUrlResolver", localContext )

	ctx = resolver.resolve( "uno:socket,host=localhost,port=%d;urp;StarOffice.ComponentContext" % OODefaultPort )
	smgr = ctx.ServiceManager

	desktop = smgr.createInstanceWithContext( "com.sun.star.frame.Desktop",ctx)

	#for filename in glob.glob('*.ppt'): #remove comment and add filename as argument of openofficeconv for batch
	
	filename = openofficeconv('COGS107C-L2-Emotion Regulation-CW.ppt')

	#Start HTML Document Manipulation

	removeblobs(filename)

	#Open in BeautifulSoup

	htmlsoup = BeautifulSoup(open(filename))

	filepath = re.compile('L[0-9]+').search(filename).group()
	
	commands.getstatusoutput('mkdir '+filepath)
	
	removecomments(htmlsoup)

	imagestrip(htmlsoup,filepath+'/'+filename)

	distributecss(htmlsoup)

	divremove(htmlsoup)

	# styleprune(htmlsoup,'glossary','color:#0000ff')

	# styleprune(htmlsoup,'anatomy','color:#00ff00')

	# styleprune(htmlsoup,'titlepage','color:#ffffff')

	# styleprune(htmlsoup,'doclink','color:#ff0000')

	stripempty(htmlsoup,'p')

	stripempty(htmlsoup,'span')

	stripempty(htmlsoup,'br')

	stripempty(htmlsoup,'link')

	onlychildlist(htmlsoup)

	stylelessspans(htmlsoup)

	output = htmlsoup.prettify()
	output = output.encode('utf-8')
	
	htmllist = output.split('<nuggetslide')
	
	for i,slide in enumerate(htmllist):
		open(filepath+'/'+'slide'+str(i)+'.html','w').write(slide[slide.find('</nuggetslide>')+14:-1])