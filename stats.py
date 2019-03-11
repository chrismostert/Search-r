import csv
import numpy as np
import scipy.stats

f1 = input('Enter filename for file 1: ')
f2 = input('Enter filename for file 2: ')

with open(f1) as csv_file:
    reader = csv.reader(csv_file)
    r1 = dict(reader)

with open(f2) as csv_file:
    reader = csv.reader(csv_file)
    r2 = dict(reader)

def parseInput(dict):
    for key in dict.keys():
        dict[key] = eval(dict[key])

parseInput(r1)
parseInput(r2)


for key in r1.keys():
    print(f1, key, np.mean(r1[key]))
    print('std',np.std(r1[key]))
    print(f2, key, np.mean(r2[key]))
    print('std',np.std(r2[key]))
    print(scipy.stats.ttest_ind(r1[key], r2[key], equal_var=False))
