# WordStream

[![WS](https://github.com/huyen-nguyen/WordStream/blob/master/images/Huffington.png)](https://www.youtube.com/watch?v=DwaDMPhi2Ec "Everything Is AWESOME")

## Updates

# WordStream-Extension Project

## Overview
The WordStream-Extension project builds upon the original WordStream tool, enhancing it with new features, datasets, and interactive visualizations. Key components include the integration of additional datasets, improvements to the existing visualization interface, and the addition of dynamic interactivity using D3.js.

## Key Features
- **Data Acquisition and Preprocessing**: Integrated new datasets and applied text preprocessing and sentiment analysis techniques.
- **Extended Visualizations**: Introduced new tabs for visualizing sentiment data, including **SentimentCloud** and **SentimentStream**.
- **Enhanced Interactivity**: Utilized D3.js for dynamic sliders and color schemes to improve user experience.
  
## Data Acquisition and Preprocessing

### Integrated Datasets:
1. **Rotten Tomatoes Movie Reviews**
2. **CNN News Articles**
3. **Reddit Posts from the /datasets Subreddit**

### Preprocessing Pipeline:
- **Data Collection**: Acquired datasets from trusted sources, ensuring diversity in the text corpora.
- **Data Cleaning**: Performed text normalization by:
  - Lowercasing text
  - Removing special characters
  - Handling missing values for consistency across datasets
- **Keyword Extraction**: Used the SpaCy library in Python to identify and extract relevant keywords for visualization.
- **Sentiment Analysis**: Applied the **VADER Sentiment Analyzer** to compute sentiment scores, categorizing text into positive, neutral, and negative sentiments.
- **Additional Data Transformation**: Aggregated data by year to calculate average sentiment and keyword frequency, facilitating temporal analysis.

Some additional datasets (e.g., social media posts and fact-check articles) were added but proved difficult to visualize in WordStream. As a result, they are only accessible through the **SentimentCloud** and **SentimentStream** tabs.

## Extending the WordStream Visualization

### New Visualization Tabs:
- **SentimentCloud**: An interactive word cloud displaying sentiment scores for various datasets.
- **SentimentStream**: A temporal sentiment analysis tool that displays the evolution of sentiments over time.

### Enhancing Interactivity with D3.js:
- **Dynamic Sliders**: Interactive sliders allow users to adjust sentiment thresholds and word rankings in real time.
- **Diverging Color Schemes**: Switched from categorical to diverging color schemes to better represent the spectrum of sentiments.

For detailed information about the classes and functions used in the implementation, refer to the **Code Documentation**.

## Running the Application

To run the application locally, follow these steps:

1. Ensure you have Python installed on your machine.
2. Open a terminal and execute the following command to start a simple HTTP server:

   ```bash
   python -m http.server 8000
   ```

3. Navigate to `http://localhost:8000` in your web browser to access the application.

## Additional Datasets

We expanded the original WordStream with several new datasets to enhance analysis capabilities:

- **Rotten Tomatoes Movie Reviews**
- **CNN News Articles**
- **Reddit Posts from the /datasets Subreddit**

Each dataset underwent extensive preprocessing:
- **Data Cleaning**: Standardized text formats and removed inconsistencies.
- **Keyword Extraction**: Identified significant terms to be visualized.
- **Sentiment Analysis**: Sentiment scores were calculated to classify words by sentiment.
- **Data Aggregation**: Yearly sentiment averages and keyword frequencies were compiled to support temporal visualization.

### SentimentCloud Tab
The **SentimentCloud** tab presents an interactive word cloud that visualizes sentiment scores:
- **Color-Coded Words**: Red for negative sentiment and blue for positive sentiment.
- **Dataset Selection**: Choose from multiple datasets to visualize sentiment dynamics.
- **Category Filtering**: Filter words by categories such as 'person', 'organization', or 'country'.
- **Sentiment Threshold Sliders**: Adjust sliders to customize sentiment classification.

### SentimentStream Tab
The **SentimentStream** tab offers temporal analysis alongside sentiment visualization:
- **Yearly Word Clouds**: Separate word clouds for each year, displaying positive and negative sentiments.
- **Interactive Line Charts**: Click on a word to generate a line chart showing sentiment evolution over time.
- **Multiple Category Comparison**: Select multiple categories to compare sentiment trends across different datasets.
- **Adjustable Sentiment Thresholds**: Similar to the SentimentCloud tab, enabling dynamic customization.

Sentiment scores are represented with a diverging color scheme:
- **Positive Sentiments**: Shades of blue, with intensity proportional to sentiment score.
- **Negative Sentiments**: Shades of red, similarly scaled.

## Links
- [Paper (Dang et al., 2019)](link_to_paper)
- [Code (GitHub repository)](link_to_github)

## References
- [Rotten Tomatoes Movie Reviews Dataset](https://www.kaggle.com/datasets/stefanoleone992/rotten-tomatoes-movies-and-critic-reviews-dataset)
- [CNN News Articles Dataset](https://www.kaggle.com/datasets/hadasu92/cnn-articles-after-basic-cleaning)
- [Reddit Dataset](https://www.kaggle.com/datasets/pavellexyr/the-reddit-dataset-dataset)
- [Social Media Sentiments Dataset](https://www.kaggle.com/datasets/kashishparmar02/social-media-sentiments-analysis-dataset)
- [Fake and Real News Dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset?resource=download)

---

This README provides an overview of the WordStream-Extension project, detailing the datasets, preprocessing steps, visualizations, and the interactive features included in the extension. For more technical details, please consult the **Code Documentation**.
