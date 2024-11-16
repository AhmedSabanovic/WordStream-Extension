# WordStream

[![WS](https://github.com/huyen-nguyen/WordStream/blob/master/images/Huffington.png)](https://www.youtube.com/watch?v=DwaDMPhi2Ec "Everything Is AWESOME")

## Updates

- **New Datasets Added**: Two datasets have been integrated into WordStream:
  - **RealNews**: This dataset originates from the [Fake and Real News Dataset on Kaggle](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset?resource=download), and has been preprocessed for improved analysis.
  - **CNN_Articles**: A second dataset has been added, which provides better visual results compared to the RealNews dataset.
- **Bug Fixes**: Various bugs have been addressed and fixed to improve the overall performance of the application.
- **Sentiment Analysis Tab**: A new tab for sentiment analysis has been introduced, though it is currently a placeholder.
- **Test Version Available**: A test version showcasing how the new features might look has been added.

### Sentiment Analysis Test Dataset:
In the sentiment analysis feature, the color-coding of sentiments is as follows:
- **Orange** indicates a neutral sentiment.
- **Red** indicates a negative sentiment.
- **Green** indicates a positive sentiment. 

These colors help provide a quick, intuitive way to gauge the emotional tone of news content.

---

## Running the Program

To run the program locally, you need to start a server. You can do this with the following command:

```bash
python -m http.server 8000
```

This will start a local HTTP server at `http://localhost:8000`, where you can view and interact with the WordStream application.
