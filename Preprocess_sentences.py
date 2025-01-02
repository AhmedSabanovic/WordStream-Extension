import re
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
import os

def analyze_sentiments(filepath):
    # Load data
    df = pd.read_csv(filepath, sep='\t', encoding='ISO-8859-1')

    # Extract year from 'Year' column (already exists)
    df['year'] = df['Year']

    analyzer = SentimentIntensityAnalyzer()

    # Column with text to analyze (Description is the primary focus here)
    text_column = 'Description'
    all_sentences = {}

    # Function to clean text (remove symbols, keep letters and spaces)
    def clean_text(text):
        return re.sub(r'[^a-zA-Z\s]', '', text)

    for _, row in df.iterrows():
        year = row['year']
        
        if pd.notna(year):  # Ensure valid year
            if pd.notna(row[text_column]):
                sentence = str(row[text_column]).strip()
                cleaned_sentence = clean_text(sentence)  # Clean sentence
                
                if cleaned_sentence:  # Process cleaned sentence
                    sentiment = analyzer.polarity_scores(cleaned_sentence)
                    normalized_score = (sentiment['compound'] + 1) / 2  # Normalize score
                    
                    if cleaned_sentence not in all_sentences:
                        all_sentences[cleaned_sentence] = {'count': 0, 'total_sentiment': 0, 'years': set()}
                    
                    all_sentences[cleaned_sentence]['count'] += 1
                    all_sentences[cleaned_sentence]['total_sentiment'] += normalized_score
                    all_sentences[cleaned_sentence]['years'].add(year)  # Track years

    # Create results
    results = []
    for sentence, stats in all_sentences.items():
        avg_sentiment = stats['total_sentiment'] / stats['count']
        for year in stats['years']:
            results.append({
                'text': sentence,
                'frequency': stats['count'],
                'sentiment': avg_sentiment,
                'year': year
            })

    # Convert to DataFrame and sort by year
    results_df = pd.DataFrame(results)
    results_df = results_df.sort_values(by='year', ascending=True)

    return results_df

# Run analysis
if __name__ == "__main__":
    input_filepath = 'data/CNN_Articles.tsv'  # Replace with your actual file path
    
    # Analyze sentiments
    df = analyze_sentiments(input_filepath)
    
    # Save the output
    base_name = os.path.splitext(os.path.basename(input_filepath))[0]
    output_filepath = os.path.join(os.path.dirname(input_filepath), f"{base_name}_sentiment.tsv")
    df.to_csv(output_filepath, sep='\t', index=False)
