## This file shows how to do a standard search on the index, this should be
## wrapped in some web interface to give back the results.

import whoosh.index as index
from whoosh.qparser import QueryParser

ix = index.open_dir("index")

with ix.searcher() as searcher:
    parser = QueryParser("content", ix.schema)
    myquery = parser.parse("piracy")
    results = searcher.search_page(myquery,1)
    for hit in results:
        print(hit['title'])
        print(hit.highlights("content"))
    
