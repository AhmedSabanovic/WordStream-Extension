# Import necessary libraries
import pandas as pd
from textblob import TextBlob

# Load the TSV file into a pandas DataFrame
file_path = r'C:\Users\ahmed\Desktop\WordStream-master\data\Test.tsv'
df = pd.read_csv(file_path, sep='\t')

# Define a function to categorize words based on sentiment
def categorize_words_by_sentiment(text):
    if pd.isnull(text):  # Handle missing values
        return [], [], []
    positive_words, negative_words, neutral_words = [], [], []
    # Split the text into words (assuming words are separated by "|")
    words = text.split('|')
    for word in words:
        sentiment = TextBlob(word).sentiment.polarity
        if sentiment > 0:
            positive_words.append(word)
        elif sentiment < 0:
            negative_words.append(word)
        else:
            neutral_words.append(word)
    return positive_words, negative_words, neutral_words

# Initialize new columns to store words based on their sentiment classification
df['positive'], df['negative'], df['neutral'] = "", "", ""

# Combine the relevant columns into one for sentiment analysis
relevant_columns = ['person', 'location', 'organization', 'miscellaneous']

# Perform sentiment analysis across relevant columns
for index, row in df.iterrows():
    # Combine the text from each relevant column
    combined_text = '|'.join([str(row[col]) for col in relevant_columns if pd.notnull(row[col])])
    pos_words, neg_words, neu_words = categorize_words_by_sentiment(combined_text)
    # Join the words by "|" and store them in respective columns
    df.at[index, 'positive'] = '|'.join(pos_words)
    df.at[index, 'negative'] = '|'.join(neg_words)
    df.at[index, 'neutral'] = '|'.join(neu_words)

# Keep only the 'source', 'time', and sentiment columns
df = df[['source', 'time', 'positive', 'negative', 'neutral']]

# Sort the DataFrame by the 'time' column from oldest to newest
df = df.sort_values(by='time')

# Save the modified DataFrame to a new TSV file
output_path = r'C:\Users\ahmed\Desktop\WordStream-master\data\Processed_Sentiment_Words.tsv'
df.to_csv(output_path, sep='\t', index=False)

print("Processed file saved to:", output_path)