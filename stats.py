import csv
import numpy as np
import scipy.stats

f1 = 'nopressure.csv'
f2 = 'pressure.csv'

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
    r1_normal_distribution = scipy.stats.shapiro(r1[key])[1] > 0.05
    r2_normal_distribution = scipy.stats.shapiro(r2[key])[1] > 0.05
    if r1_normal_distribution and r2_normal_distribution:
        print('Results have a normal distribution. t-test')
        print(f1, key, 'mean=', np.mean(r1[key]))
        print('std', np.std(r1[key]))
        print(f2, key, 'mean=', np.mean(r2[key]))
        print('std', np.std(r2[key]))
        print(scipy.stats.ttest_ind(r1[key], r2[key], equal_var=False))
    else:
        print('Results do not have a normal distribution. Mann–Whitney U test.')
        print(f1, key, 'median=', np.median(r1[key]))
        print('se', np.std(r1[key])/np.sqrt(len(r1)))
        print(f2, key, 'median=', np.median(r2[key]))
        print('se', np.std(r2[key])/np.sqrt(len(r2)))
        print(scipy.stats.mannwhitneyu(r1[key], r2[key]))
    print()
