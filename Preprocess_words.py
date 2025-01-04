import re
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
import os

def analyze_sentiments(filepath):
    # Load data
    df = pd.read_csv(filepath, sep='\t', encoding='ISO-8859-1')

    # Extract year from 'time' column
    df['year'] = pd.to_datetime(df['time'], errors='coerce').dt.year

    analyzer = SentimentIntensityAnalyzer()

    # Columns with text to analyze
    text_columns = ['person', 'location', 'organization', 'miscellaneous']
    categorized_words = {col: {} for col in text_columns}  # Store words per category

    # Function to clean words (remove symbols, keep letters and spaces)
    def clean_word(word):
        return re.sub(r'[^a-zA-Z\s]', '', word)

    for _, row in df.iterrows():
        year = row['year']
        
        if pd.notna(year):  # Ensure valid year
            for col in text_columns:
                if pd.notna(row[col]):
                    words = str(row[col]).split('|')
                    for word in words:
                        word = word.strip()
                        cleaned_word = clean_word(word)  # Clean word
                        if cleaned_word:  # Process cleaned word
                            sentiment = analyzer.polarity_scores(cleaned_word)
                            normalized_score = (sentiment['compound'] + 1) / 2
                            
                            if cleaned_word not in categorized_words[col]:
                                categorized_words[col][cleaned_word] = {'count': 0, 'total_sentiment': 0, 'years': set()}
                            categorized_words[col][cleaned_word]['count'] += 1
                            categorized_words[col][cleaned_word]['total_sentiment'] += normalized_score
                            categorized_words[col][cleaned_word]['years'].add(year)  # Track years

    # Create results
    results = []
    for category, words in categorized_words.items():
        for word, stats in words.items():
            avg_sentiment = stats['total_sentiment'] / stats['count']
            for year in stats['years']:
                results.append({
                    'year': year,
                    'category': category,
                    'text': word,
                    'frequency': stats['count'],
                    'sentiment': avg_sentiment
                })

    # Convert to DataFrame and sort by year, then category, then frequency
    results_df = pd.DataFrame(results)
    results_df = results_df.sort_values(by=['year', 'category', 'frequency'], ascending=[True, True, False])

    return results_df

# Run analysis
if __name__ == "__main__":
    input_filepath = 'data/CrooksAndLiars.tsv'  # Replace with desired dataset
    
    # Analyze sentiments
    df = analyze_sentiments(input_filepath)
    
    # Save the output
    base_name = os.path.splitext(os.path.basename(input_filepath))[0]
    output_filepath = os.path.join(os.path.dirname(input_filepath), f"{base_name}_sentiment.tsv")
    df.to_csv(output_filepath, sep='\t', index=False)
