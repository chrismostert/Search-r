## Creates an index from a folder of TRAC articles

from whoosh.index import create_in
from whoosh.fields import *
from whoosh.qparser import QueryParser
from bs4 import BeautifulSoup
import os
import re

rels = set()
# Get all docids for the TREC robus 2005 track
with open('qrels.txt', 'r') as q:
    content = q.read()
    for id in re.findall(r'\d+ 0 (\w+.\w+) \d', content):
        rels.add(str(id))

print(rels)


## Define the schema
schema = Schema(title=TEXT(stored=True), docID=ID(stored=True), content=TEXT(stored=True))
ix = create_in("index", schema)

writer = ix.writer();
matchcount = 1

# For every file in the 'aquaint' folder, index it
for root, dirs, files in os.walk('aquaint'):
    for file in files:
        with open(os.path.join(root, file), "r") as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            for doc in soup.find_all('doc'):
                try:
                    t = str(doc.find('headline').text)
                except:
                    t = u"No title available"
                try:
                    d = str(doc.find('docno').text)
                except:
                    d = u"No docID available"
                try:
                    c = str(doc.find('text').text)
                except:
                    c = u"No content available"

                if(d.replace(' ', '') in rels):
                    print('Total matches', matchcount)
                    matchcount += 1
                    writer.add_document(title=t, docID=d, content=c)

writer.commit()
