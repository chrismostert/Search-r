All of the dependencies needed can  be installed by running `pip install -r requirements`

The search engine can then be started by running `python app.py`

The interface is then available at `http://localhost:5000`

Read in the `out.csv` files from `parselog.py` using:
`with open('out.csv') as csv_file:
    reader = csv.reader(csv_file)
    mydict = dict(reader)`
