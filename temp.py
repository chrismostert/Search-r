import numpy as np
import scipy.stats

nop = [7,7,7,6,7,6]
p = [5,6,8,6,7,8,5,6,5]

print('np', np.mean(nop), np.std(nop))
print('p', np.mean(p), np.std(p))

print(scipy.stats.mannwhitneyu(nop, p))
