All of the dependencies needed can  be installed by running `pip install -r requirements`

The search engine can then be started by running `python app.py`

A folder `index` has to be placed in the root of the folder, containing the index which Whoosh can use.

The interface is then available at `http://localhost:5000`

The log files can be parsed using the `parselog.py` script, which parses all files in the /log folder, and outputs the metrics to `out.csv`

`stats.py` can be used to calculate means, standard deviations and t-test statistics between two files outputted by `parselog.py`. 
