## Creates an index from a folder of TRAC articles

from whoosh.index import create_in
from whoosh.fields import *
from whoosh.qparser import QueryParser
from bs4 import BeautifulSoup
import os

## Define the schema
schema = Schema(title=TEXT(stored=True), docID=ID(stored=True), content=TEXT(stored=True))
ix = create_in("index", schema)

writer = ix.writer();

# For every file in the 'aquaint' folder, index it
for root, dirs, files in os.walk('aquaint'):
    for file in files:
        with open(os.path.join(root, file), "r") as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            for doc in soup.find_all('doc'):
                try:
                    t = str(doc.find('headline').string)
                except:
                    t = u"No title available"
                try:
                    d = str(doc.find('docno').string)
                except:
                    d = u"No docID available"
                try:
                    c = str(doc.find('text').string)
                except:
                    c = u"No content available"

                writer.add_document(title=t, docID=d, content=c)

writer.commit()
