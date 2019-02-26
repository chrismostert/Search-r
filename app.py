from flask import Flask
from flask import render_template
from flask import request

import whoosh.index as index
from whoosh.qparser import QueryParser
app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('frontpage.html')


@app.route('/search', methods=['GET'])
def search():
    q = request.args.get("q")
    ix = index.open_dir("index")

    resultlist = []
    with ix.searcher() as searcher:
        parser = QueryParser("content", ix.schema)
        myquery = parser.parse(q)
        results = searcher.search_page(myquery, 1)
        for hit in results:
            resultlist.append({"title": hit['title'], "docid": hit["docID"], "highlight": hit.highlights("content"), "content": hit['content']})

    return render_template('search.html', entries=resultlist, q=q)



if __name__ == '__main__':
    app.run()
