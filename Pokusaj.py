import pandas as pd
import random

# Load the TSV file into a pandas DataFrame
file_path = r'C:\Users\ahmed\Desktop\WordStream-master\data\FactCheck.tsv'
df = pd.read_csv(file_path, sep='\t')

# Function to randomly assign words to columns
def randomize_words(row):
    words = []
    if pd.notnull(row['miscellaneous']):
        words.extend(row['miscellaneous'].split('|'))
    random.shuffle(words)
    num_words = len(words)
    if num_words > 0:
        split1 = random.randint(0, num_words)
        split2 = random.randint(split1, num_words)
        row['person'] = '|'.join(words[:split1])
        row['location'] = '|'.join(words[split1:split2])
        row['organization'] = '|'.join(words[split2:])
    else:
        row['person'], row['location'], row['organization'] = '', '', ''
    row['miscellaneous'] = ''  # Ensure the miscellaneous column is empty
    return row

# Apply the randomize_words function to each row
df = df.apply(randomize_words, axis=1)

# Save the modified DataFrame to a new TSV file
output_path = r'C:\Users\ahmed\Desktop\WordStream-master\data\Test.tsv'
df.to_csv(output_path, sep='\t', index=False)

print("Processed file saved to:", output_path)