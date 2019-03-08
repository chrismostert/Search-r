import re
import datetime
import time
import os
import csv

# Variables we want to calculate
timepertopic = []
timeperquery = []
timepersearchpage = []

queriespertopic = []
docviewspertopic = []
flagspertopic = []

docviewsperquery = []
pagedepthperquery = []
flagsperquery = []

interactiverecall = []
interactivetrecprecision = []
interactiveuserprecision = []


# Map topic numbers to trec ids
trecids = {"1":"354", "2":"367", "3":"394", "4":"639"}


# Function to calculate the amount of seconds between two dates
def diffDates(d1, d2):
    return (time.mktime(time.strptime(d2, "%H:%M:%S")) -
               time.mktime(time.strptime(d1, "%H:%M:%S")))


# Function to get pairwise differences of a list of diffdates
def pairedDiff(dates):
    res = []
    for i in range(0, len(dates)-1):
        res.append(diffDates(dates[i], dates[i+1]))
    return res


# Function to count the amount of viewed documents on a log
def countViews(log):
    docviews = set()
    for id in re.findall(r'"message":"Toggle view article \((\w+)', log):
        docviews.add(id)
    return len(docviews)


def countFlags(log):
    flags = set()
    for id in re.findall(r'"message":"Select \((\w+)', log):
        flags.add(id)
    return len(flags)

# Function to fit the formatting of the ID in the log by adding a dot
def formatID(id):
    a = id[:-4]
    b = id[-4:]
    return a + '.' + b

print('Running metrics over all log files in the /log folder...')
for file in os.listdir('logs'):
    with open(os.path.join('logs', file), 'r') as f:
        print('Parsing',file)
        # Read in the file
        log = str(f.read())

        # Get topics
        topics = re.findall(r'"message":"Start topic (\d+)', log)

        # Create sets for viewed and selected documents
        t1_viewed = set()
        t2_viewed = set()
        t1_selected = set()
        t2_selected = set()

        # Get list of viewed and selected documents
        splits = re.split(r'.*"message":"Start topic \d+.*', log)
        for i in range(1, len(splits)):
            for id in re.findall(r'"message":"Toggle view article \((\w+)', splits[i]):
                id = formatID(id)
                if i == 1:
                    t1_viewed.add(id)
                else:
                    t2_viewed.add(id)
            for id in re.findall(r'"message":"Select \((\w+)', splits[i]):
                id = formatID(id)
                if i == 1:
                    t1_selected.add(id)
                else:
                    t2_selected.add(id)

        # Get time spent on each topic
        topictimes = re.findall(r'.*(\d\d:\d\d:\d\d).*(?:"message":"Start topic|"message":"Done with topic)', log)
        timepertopic.append(diffDates(topictimes[0], topictimes[1]))
        timepertopic.append(diffDates(topictimes[2], topictimes[3]))

        # Get time spent on each Query
        querytimes = re.findall(r'.*(\d\d:\d\d:\d\d) > Page 1 Query ".+"', log)
        timeperquery = pairedDiff(querytimes)

        # Get time spent on each search page
        pagetimes = re.findall(r'.*(\d\d:\d\d:\d\d) > Page \d+ Query ".+"', log)
        timepersearchpage = pairedDiff(pagetimes)

        # Per topic metrics
        splits = re.split(r'.*"message":"Start topic \d+.*', log)
        for i in range(1, len(splits)):
            queriespertopic.append(len(re.findall(r'> Page 1 Query ".+"', splits[i])))
            docviewspertopic.append(countViews(splits[i]))
            flagspertopic.append(countFlags(splits[i]))

        # Per query metrics
        splits = re.split(r'> Page 1 Query ".+"', log)
        for i in range(1, len(splits)):
            docviewsperquery.append(countViews(splits[i]))
            flagsperquery.append(countFlags(splits[i]))

            maxDepth = 1
            for depth in re.findall(r'.*Page (\d+) Query ".+"', splits[i]):
                if int(depth) > maxDepth:
                    maxDepth = int(depth)

            pagedepthperquery.append(maxDepth)

        # Calculate performance metrics
        t1_rels = set()
        t2_rels = set()

        with open('qrels.txt', 'r') as f:
            rels = f.read()
            for id in re.findall(r'(?:' + trecids[topics[0]] + ') 0 (\w+.\w+)', rels):
                t1_rels.add(id)
            for id in re.findall(r'(?:' + trecids[topics[1]] + ') 0 (\w+.\w+)', rels):
                t2_rels.add(id)

        interactiverecall.append(len(t1_rels.intersection(t1_selected))/len(t1_rels))
        interactiverecall.append(len(t2_rels.intersection(t2_selected))/len(t2_rels))

        interactivetrecprecision.append(len(t1_rels.intersection(t1_viewed))/len(t1_viewed))
        interactivetrecprecision.append(len(t2_rels.intersection(t2_viewed))/len(t2_viewed))

        interactiveuserprecision.append(len(t1_rels.intersection(t1_selected))/len(t1_selected))
        interactiveuserprecision.append(len(t2_rels.intersection(t2_selected))/len(t2_selected))

output = {'timepertopic': timepertopic,
    'timeperquery': timeperquery,
    'timepersearchpage': timepersearchpage,
    'queriespertopic': queriespertopic,
    'docviewspertopic': docviewspertopic,
    'flagspertopic': flagspertopic,
    'docviewsperquery': docviewsperquery,
    'pagedepthperquery': pagedepthperquery,
    'flagsperquery': flagsperquery,
    'interactiverecall': interactiverecall,
    'interactivetrecprecision': interactivetrecprecision,
    'interactiveuserprecision': interactiveuserprecision}

print('Writing to out.csv...')

with open('out.csv', 'w') as csv_file:
    writer = csv.writer(csv_file)
    for key, value in output.items():
        writer.writerow([key, value])

print('Done!')
