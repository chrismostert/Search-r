from flask import Flask
from flask import render_template
from flask import request



app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('frontpage.html')


@app.route('/search')
def search():
    q = request.args.get("q")
    #TODO perform search!!!!
    results = ["1","2"]
    return render_template('search.html', entries=results)



if __name__ == '__main__':
    app.run()
