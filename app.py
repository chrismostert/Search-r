from flask import Flask
from flask import Response
from flask import render_template
from flask import request
import numpy as np
import os

import whoosh.index as index
from whoosh.qparser import QueryParser
import time
import timeit

app = Flask(__name__)

startstr = time.strftime("%Y%m%d%H%M%S", time.gmtime())


@app.route('/')
def hello_world():
    return render_template('frontpage.html')

@app.route('/log', methods=['POST'])
def log():
    data = request.get_data()
    writeLog(data)
    return Response("{'status':'ok'}", status=200)

def writeLog(data):
    with open("%s-user-activity.txt" % startstr, "a") as f:
        timestr = time.strftime("%d %b %Y %H:%M:%S", time.gmtime())
        f.write("{} > {}\r\n".format(timestr, data))


@app.route('/search', methods=['GET'])
def search():
    if "q" not in request.args:
        return render_template('frontpage.html')

    start = timeit.default_timer()

    q = request.args.get("q")
    page = int(request.args.get("p")) if "p" in request.args else 1
    writeLog("Page {} Query \"{}\"".format(page, q))
    ix = index.open_dir("index")

    resultlist = []
    with ix.searcher() as searcher:
        parser = QueryParser("content", ix.schema)
        myquery = parser.parse(q)
        results = searcher.search_page(myquery, page)
        for hit in results:
            resultlist.append({"title": hit['title'], "docid": hit["docID"], "highlight": hit.highlights("content"), "content": hit['content']})

    stop = timeit.default_timer()

    writeLog("Searcher took {:10.4f} s".format(stop - start))
    print('Time: ', stop - start)
    print(np.ceil(len(results)/10))
    print(page)
    return render_template('search.html', entries=resultlist, q=q, totalpages=int(np.ceil(len(results)/10)), currentpage=page)



if __name__ == '__main__':
    BASE_DIR = os.path.dirname(os.path.realpath(__file__))
    index_folder = "{}/index".format(BASE_DIR)
    if os.path.exists(index_folder):
        app.run()
    else:
        print("The index folder is not present. Exiting.")


