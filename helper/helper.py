import json

def is_neighbor(word1, word2):
    return sum(a != b for a, b in zip(word1, word2)) == 1

# Load the word list
with open('js/wordList.json', 'r') as file:
    word_list = json.load(file)
    word_set = set(word_list)  # Use a set for O(1) lookups

# Precompute the neighbors
neighbors_dict = {}
for word in word_list:
    neighbors_dict[word] = [
        potential_neighbor for potential_neighbor in word_list
        if is_neighbor(word, potential_neighbor)
    ]

# Save the neighbors to a JSON file
with open('wordNeighbors.json', 'w') as file:
    json.dump(neighbors_dict, file, indent=4)
