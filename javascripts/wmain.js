// Global variables
let words = [];
const width = 1000; 
const height = 600;
const minFontSize = 30; 
const maxFontSize = 50; 
let yearRange = { min: 2004, max: 2014 }; 
let selectedCategories = ['location', 'person', 'organization', 'miscellaneous'];

// Color scale
const colorScale = d3.scaleSequential()
    .domain([0, 1])
    .interpolator(d3.interpolateRdBu);

// Word cloud layouts
const layoutPositive = d3.layout.cloud()
    .size([width, height / 2])
    .padding(2) 
    .rotate(() => 0)
    .font("Arial")
    .fontSize(d => Math.max(Math.sqrt(d.frequency) * 10, minFontSize))
    .on("end", drawPositive);

const layoutNegative = d3.layout.cloud()
    .size([width, height / 2])
    .padding(2) 
    .rotate(() => 0)
    .font("Arial")
    .fontSize(d => Math.max(Math.sqrt(d.frequency) * 10, minFontSize))
    .on("end", drawNegative);

// Draw functions
function drawPositive(words) {
    const svg = d3.select("#wordcloud svg.positive");
    svg.selectAll("*").remove();

    svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 4})`)
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .attr("class", "word")
        .style("font-size", d => `${Math.min(d.size, maxFontSize)}px`)
        .style("font-family", "Arial")
        .style("fill", d => colorScale(d.sentiment))
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text(d => d.text)
        .style("opacity", 0)
        .transition()
        .duration(600)
        .style("opacity", 1);
}

function drawNegative(words) {
    const svg = d3.select("#wordcloud svg.negative");
    svg.selectAll("*").remove();

    svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 4})`)
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .attr("class", "word")
        .style("font-size", d => `${Math.min(d.size, maxFontSize)}px`)
        .style("font-family", "Arial")
        .style("fill", d => colorScale(d.sentiment))
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text(d => d.text)
        .style("opacity", 0)
        .transition()
        .duration(600)
        .style("opacity", 1);
}

// Initialize sliders
function initializeSliders() {
    const yearSlider = document.getElementById('yearSlider');
    noUiSlider.create(yearSlider, {
        start: 2004,
        range: {
            'min': 2004,  
            'max': 2014
        },
        step: 1,
        tooltips: true,
        format: {
            to: value => Math.round(value),
            from: value => Math.round(value)
        }
    });

    const positiveThreshold = document.getElementById('positiveThreshold');
    noUiSlider.create(positiveThreshold, {
        start: 0.7,
        range: { min: 0.6, max: 1.0 },
        step: 0.05,
        tooltips: true,
        format: {
            to: value => value.toFixed(2),
            from: value => parseFloat(value)
        }
    });

    const negativeThreshold = document.getElementById('negativeThreshold');
    noUiSlider.create(negativeThreshold, {
        start: 0.3,
        range: { min: 0, max: 0.45 },
        step: 0.05,
        tooltips: true,
        format: {
            to: value => value.toFixed(2),
            from: value => parseFloat(value)
        }
    });

    // Event listeners
    yearSlider.noUiSlider.on('update', updateFilters);
    positiveThreshold.noUiSlider.on('update', updateFilters);
    negativeThreshold.noUiSlider.on('update', updateFilters);
}

// Update filters
function updateFilters() {
    const posThreshold = +positiveThreshold.noUiSlider.get();
    const negThreshold = +negativeThreshold.noUiSlider.get();
    const selectedYear = +yearSlider.noUiSlider.get();
    
    let filteredWords = words.filter(d => d.year === selectedYear);
    
    if (selectedCategories.length > 0 && !selectedCategories.includes('uncategorized')) {
        filteredWords = filteredWords.filter(d => selectedCategories.includes(d.category));
    }
    
    const positiveWords = filteredWords
        .filter(d => d.sentiment >= posThreshold)
        .slice(0, 20);
    
    const negativeWords = filteredWords
        .filter(d => d.sentiment <= negThreshold)
        .slice(0, 20);
    
    layoutPositive.words(positiveWords).start();
    layoutNegative.words(negativeWords).start();
}

// Load and process data
function loadData(dataset) {
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    d3.tsv(`data/${dataset}`).then(data => {
        const uniqueWords = new Map();
        const categories = new Set();
        const years = new Set();

        data.forEach(d => {
            if (!uniqueWords.has(d.text)) {
                if (d.category) categories.add(d.category);
                years.add(+d.year);
                uniqueWords.set(d.text, {
                    text: d.text,
                    sentiment: +d.sentiment,
                    frequency: +d.frequency,
                    year: +d.year,
                    category: d.category || 'uncategorized',
                    size: Math.sqrt(+d.frequency) * 10
                });
            }
        });
        
        words = Array.from(uniqueWords.values());
        updateCategorySelector(Array.from(categories));
        
        // Update year range based on dataset
        const yearArray = Array.from(years);
        yearRange = {
            min: Math.min(...yearArray),
            max: Math.max(...yearArray)
        };
        
        const yearSlider = document.getElementById('yearSlider');
        if (yearSlider && yearSlider.noUiSlider) {
            yearSlider.noUiSlider.updateOptions({
                range: {
                    'min': yearRange.min,
                    'max': yearRange.max
                },
                start: yearRange.min
            }, true); // true preserves the margin
        }
        
        updateFilters();
    })
    .catch(error => console.error("Error loading data:", error))
    .finally(() => {
        document.getElementById('loadingOverlay').style.display = 'none';
    });
}

// Update category selector
function updateCategorySelector(categories) {
    const selector = d3.select("#categorySelector");
    selector.selectAll("option").remove();
    
    selector.append("option")
        .attr("value", "all")
        .text("All Categories");
    
    if (categories.length > 0) {
        categories.forEach(category => {
            selector.append("option")
                .attr("value", category)
                .text(category);
        });
        d3.select(".control-group:has(#categorySelector)").style("display", "flex");
        selectedCategories = categories;
    } else {
        d3.select(".control-group:has(#categorySelector)").style("display", "none");
        selectedCategories = ['uncategorized'];
    }
    
    selector.selectAll("option").property("selected", true);
}

// Initialize visualization
function init() {
    d3.select("#wordcloud")
        .append("svg").attr("class", "positive")
        .attr("width", width).attr("height", height / 2);
    
    d3.select("#wordcloud")
        .append("svg").attr("class", "negative")
        .attr("width", width).attr("height", height / 2)
        .attr("y", height / 2);
    
    initializeSliders();
    
    // Event listeners
    d3.select("#datasetSelector").on("change", function() {
        loadData(this.value);
    });
    
    d3.select("#categorySelector").on("change", function() {
        const selectedOptions = Array.from(this.selectedOptions).map(option => option.value);
        selectedCategories = selectedOptions.includes('all') ? 
            ['location', 'person', 'organization', 'miscellaneous'] : 
            selectedOptions;
        updateFilters();
    });
    
    // Load initial dataset
    loadData("WikiNews_sentiment.tsv");
}

// Start visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
