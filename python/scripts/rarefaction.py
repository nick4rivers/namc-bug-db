import numpy as np
from copy import copy

goal_records = 10

# Original data
bugs = {
    "SPECIESA": 19,
    "SPECIESB": 10,
    "SPECIESC": 1
}

print(bugs)

rarified = copy(bugs)

# Set the seed for testing. ALWAYS DO THIS!!!
# comment this out to see different results
np.random.seed(0)

total = sum(rarified.values())
deleted = []
while (total > goal_records):
    available = {k: v for k, v in rarified.items() if v > 0}
    total_records = len(available.keys())

    # Probabilities are basically just summing to 1
    probabilities = [x / total for x in available.values()]

    choice = np.random.choice(list(available.keys()), p=probabilities)

    if rarified[choice] > 0:
        deleted.append(choice)
        rarified[choice] -= 1

    total = sum(rarified.values())

print('deleted', deleted, '\n\n')
print('rarified', rarified)
