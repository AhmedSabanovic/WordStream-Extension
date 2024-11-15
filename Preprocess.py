import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import spacy

# Load the spaCy model for named entity recognition
nlp = spacy.load("en_core_web_trf")  

# Step 1: Read the CSV file
file_path = 'True.csv'
true_df = pd.read_csv(file_path)

# Step 2: Tokenize the text and Step 3: Calculate sudden attention measure
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(true_df['text'])
tfidf_scores = np.asarray(X.mean(axis=0)).flatten()
words = vectorizer.get_feature_names_out()

# Create a DataFrame with words and their corresponding tfidf scores
word_scores = pd.DataFrame({'word': words, 'score': tfidf_scores})

# Step 4: Filter words based on sudden attention measure
threshold = word_scores['score'].quantile(0.75)  # Keep top 25% words
important_words = word_scores[word_scores['score'] >= threshold]['word'].tolist()

# Function to filter important words from text
def filter_important_words(text):
    tokens = text.split()
    return ' '.join([word for word in tokens if word in important_words])

# Apply the filter function to the text column
true_df['filtered_text'] = true_df['text'].apply(filter_important_words)

# Function to extract named entities
def extract_entities(text):
    doc = nlp(text)
    persons = []
    locations = []
    organizations = []
    miscellaneous = []
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            persons.append(ent.text)
        elif ent.label_ in ["GPE", "LOC"]:
            locations.append(ent.text)
        elif ent.label_ == "ORG":
            organizations.append(ent.text)
        else:
            miscellaneous.append(ent.text)
    return '|'.join(persons), '|'.join(locations), '|'.join(organizations), '|'.join(miscellaneous)

# Apply the entity extraction function to the filtered text column
true_df[['person', 'location', 'organization', 'miscellaneous']] = true_df['filtered_text'].apply(lambda x: pd.Series(extract_entities(x)))

# Step 5: Format the output
# Create columns for source and time
true_df['source'] = ''
true_df['time'] = pd.to_datetime(true_df['date']).dt.strftime('%Y-%m-%d %H:%M:%S')

# Sort the DataFrame by time from oldest to newest
true_df = true_df.sort_values(by='time')

# Select and rename columns to match the desired format
output_df = true_df[['source', 'time', 'person', 'location', 'organization', 'miscellaneous']]
output_df.columns = ['source', 'time', 'person', 'location', 'organization', 'miscellaneous']

# Save the output to a TSV file
output_df.to_csv('truenews.tsv', sep='\t', index=False)