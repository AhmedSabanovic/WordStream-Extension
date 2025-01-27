let selectedCategories = ['location', 'person', 'organization', 'miscellaneous'];
let margin = { left: 100, right: 100, top: 20, bottom: 40 };
let width = 4000;
let height = window.innerHeight - 150; // Subtract space for header and padding
let words = [];

function loadData(dataset) {
    d3.tsv(`data/${dataset}`).then(data => {
        allData = data.map(d => ({
            text: d.text,
            sentiment: +d.sentiment,
            frequency: +d.frequency,
            year: +d.year,
            category: d.category || 'miscellaneous'
        }));

        // Summarize for main visualization
        const uniqueWords = new Map();
        allData.forEach(d => {
            if (!uniqueWords.has(d.text)) {
                uniqueWords.set(d.text, d);
            }
        });
        words = Array.from(uniqueWords.values());
        updateVisualization();
    });
}
function showDetail(wordText) {
    const modal = document.getElementById("detailModal");
    const backdrop = document.getElementById("modalBackdrop");
    const loadingSpinner = document.querySelector(".loading-spinner");
    
    backdrop.style.display = "block";
    modal.style.display = "block";
    loadingSpinner.classList.add("active");
    setTimeout(() => modal.classList.add("active"), 10);
    
    document.querySelector(".modal-title").textContent = `Sentiment Analysis: "${wordText}"`;

    // Setup dimensions
    const margin = {top: 40, right: 40, bottom: 50, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create SVG
    const detailSvg = d3.select("#detailChart")
        .html("")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create gradient
    const gradient = detailSvg.append("defs")
        .append("linearGradient")
        .attr("id", "area-gradient")
        .attr("x1", "0%").attr("y1", "100%")
        .attr("x2", "0%").attr("y2", "0%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#4682b4")
        .attr("stop-opacity", 0.1);
    
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#4682b4")
        .attr("stop-opacity", 0.4);

    // Process data
    const dataForWord = allData.filter(d => d.text === wordText)
        .sort((a,b) => a.year - b.year);

    // Create scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(dataForWord, d => d.year))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);

    // Add grid
    detailSvg.append("g")
        .attr("class", "grid")
        .attr("opacity", 0.1)
        .call(d3.axisLeft(yScale)
            .tickSize(-width)
            .tickFormat(""));

    // Add axes
    detailSvg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    detailSvg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    // Add labels
    detailSvg.append("text")
        .attr("x", width/2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Year");

    detailSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Sentiment Score");

    // Create line and area
    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.sentiment))
        .curve(d3.curveMonotoneX);

    const area = d3.area()
        .x(d => xScale(d.year))
        .y0(height)
        .y1(d => yScale(d.sentiment))
        .curve(d3.curveMonotoneX);

    // Add area
    detailSvg.append("path")
        .datum(dataForWord)
        .attr("class", "area")
        .attr("d", area)
        .style("fill", "url(#area-gradient)");

    // Add line with animation
    const path = detailSvg.append("path")
        .datum(dataForWord)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3)
        .attr("d", line);

    const totalLength = path.node().getTotalLength();
    path.attr("stroke-dasharray", totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1500)
        .attr("stroke-dashoffset", 0);

    // Add interactive points
    detailSvg.selectAll(".dot")
        .data(dataForWord)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.sentiment))
        .attr("r", 6)
        .style("fill", "white")
        .style("stroke", "steelblue")
        .style("stroke-width", 2)
        .style("opacity", 0)
        .transition()
        .delay((d, i) => i * 100)
        .duration(500)
        .style("opacity", 1)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 8)
                .style("fill", "steelblue");

            detailSvg.append("text")
                .attr("class", "tooltip")
                .attr("x", xScale(d.year))
                .attr("y", yScale(d.sentiment) - 15)
                .attr("text-anchor", "middle")
                .text(`${d.year}: ${d.sentiment.toFixed(3)}`);
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 6)
                .style("fill", "white");
            
            detailSvg.selectAll(".tooltip").remove();
        });

    loadingSpinner.classList.remove("active");
}
document.getElementById("closeDetail").onclick = () => {
    const modal = document.getElementById("detailModal");
    const backdrop = document.getElementById("modalBackdrop");
    
    modal.classList.remove("active");
    setTimeout(() => {
        modal.style.display = "none";
        backdrop.style.display = "none";
    }, 300);
};
document.getElementById("modalBackdrop").onclick = () => {
    document.getElementById("closeDetail").click();
};

const svg = d3.select("#wordstream")
    .append("svg")
    .attr("width", 4000)
    .attr("height", 1000);

const colorScale = d3.scaleSequential()
    .domain([0, 1])
    .interpolator(t => {
        if (t <= 0.4) {  
            const intensity = t / 0.4;  
            return d3.interpolateRgb("#DC143C", "#FF4444")(intensity);
        } else if (t >= 0.6) {  
            const intensity = (t - 0.6) / 0.4;  
            return d3.interpolateRgb("#4169E1", "#1E90FF")(intensity);
        } else {  
            return "#cccccc";  
        }
    });
function updateVisualization() {
    svg.selectAll("*").remove();
    const years = [...new Set(words.map(d => d.year))].sort();
    const xScale = createTimeline(years);
    
    const posThreshold = +positiveThreshold.noUiSlider.get();
    const negThreshold = +negativeThreshold.noUiSlider.get();
    
    // Grid system for collision detection
    const occupiedSpaces = new Map();
    const yearWidth = 140; // Width allocated per year
    const verticalSpacing = 15;
    
    function checkCollision(x, y, width, height) {
        const buffer = 5; // Reduced buffer space between words
        const area = {
            left: x - width/2 - buffer,
            right: x + width/2 + buffer,
            top: y - height/2 - buffer,
            bottom: y + height/2 + buffer
        };
        
        return Array.from(occupiedSpaces.values()).some(space => 
            !(area.left > space.right || 
            area.right < space.left || 
            area.top > space.bottom || 
            area.bottom < space.top)
        );
    }
    
    function addOccupiedSpace(id, x, y, width, height) {
        occupiedSpaces.set(id, {
            left: x - width/2,
            right: x + width/2,
            top: y - height/2,
            bottom: y + height/2
        });
    }

    years.forEach(year => {
        const yearWords = words.filter(w => w.year === year);
        const baseX = xScale(year);
        
        // Process positive words
        const positiveWords = yearWords
            .filter(w => w.sentiment >= posThreshold)
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 15);
            
        let posY = height/2 - 40;
        positiveWords.forEach((word, i) => {
            const fontSize = Math.min(Math.sqrt(word.frequency) * 3 + 10, 20);
            const wordWidth = word.text.length * fontSize * 0.6;
            const wordHeight = fontSize * 1.2;
            
            let placed = false;
            let attempts = 0;
            let testX = baseX;
            let testY = posY;
            
            while (!placed && attempts < 50) {
                testX = baseX + (Math.random() - 0.5) * yearWidth;
                testY = posY - attempts * verticalSpacing;
                if (testY - wordHeight / 2 < 0 || testY + wordHeight / 2 > height) {
                    attempts++;
                    continue;
                }
                
                if (!checkCollision(testX, testY, wordWidth, wordHeight)) {
                    placed = true;
                    addOccupiedSpace(`pos-${year}-${i}`, testX, testY, wordWidth, wordHeight);
                    
                    svg.append("text")
                        .attr("class", "word")
                        .attr("x", testX)
                        .attr("y", testY)
                        .attr("text-anchor", "middle")
                        .style("font-size", `${fontSize}px`)
                        .style("fill", colorScale(word.sentiment))
                        .style("cursor", "pointer")
                        .text(word.text)
                        .on("click", () => showDetail(word.text))
                        .on("mouseover", function() {
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .style("font-size", `${fontSize * 1.2}px`);
                        })
                        .on("mouseout", function() {
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .style("font-size", `${fontSize}px`);
                        });
                }
                attempts++;
            }
        });
        
        // Process negative words
        const negativeWords = yearWords
            .filter(w => w.sentiment <= negThreshold)
            .sort((a, b) => a.frequency - b.frequency)
            .slice(0, 15);
            
        let negY = height/2 + 50;
        negativeWords.forEach((word, i) => {
            const fontSize = Math.min(Math.sqrt(word.frequency) * 3 + 10, 20);
            const wordWidth = word.text.length * fontSize * 0.6;
            const wordHeight = fontSize * 1.2;
            
            let placed = false;
            let attempts = 0;
            let testX = baseX;
            let testY = negY;
            
            while (!placed && attempts < 50) {
                testX = baseX + (Math.random() - 0.5) * yearWidth;
                testY = negY + attempts * verticalSpacing;
                if (testY - wordHeight / 2 < 0 || testY + wordHeight / 2 > height) {
                    attempts++;
                    continue;
                }
                
                if (!checkCollision(testX, testY, wordWidth, wordHeight)) {
                    placed = true;
                    addOccupiedSpace(`neg-${year}-${i}`, testX, testY, wordWidth, wordHeight);
                    
                    svg.append("text")
                        .attr("class", "word")
                        .attr("x", testX)
                        .attr("y", testY)
                        .attr("text-anchor", "middle")
                        .style("font-size", `${fontSize}px`)
                        .style("fill", colorScale(word.sentiment))
                        .style("cursor", "pointer")
                        .text(word.text)
                        .on("click", () => showDetail(word.text))
                        .on("mouseover", function() {
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .style("font-size", `${fontSize * 1.2}px`);
                        })
                        .on("mouseout", function() {
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .style("font-size", `${fontSize}px`);
                        });
                }
                attempts++;
            }
        });
    });
}

function createTimeline(years) {
    const xScale = d3.scaleLinear()
        .domain([d3.min(years), d3.max(years)])
        .range([margin.left + 100, width - margin.right - 100]);

    svg.append("line")
        .attr("class", "timeline")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", height / 2)
        .attr("y2", height / 2)
        .style("stroke", "#333")
        .style("stroke-width", "3px");

    years.forEach(year => {
        svg.append("text")
            .attr("class", "year-marker")
            .attr("x", xScale(year))
            .attr("y", height / 2 + 30)
            .attr("text-anchor", "middle")
            .style("fill", "#333")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text(year);
    });

    return xScale;
}

// Initialize sliders
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

noUiSlider.create(negativeThreshold, {
    start: 0.3,
    range: { min: 0, max: 0.4 },
    step: 0.05,
    tooltips: true,
    format: {
        to: value => value.toFixed(2),
        from: value => parseFloat(value)
    }
});

// Event listeners
positiveThreshold.noUiSlider.on('update', updateVisualization);
negativeThreshold.noUiSlider.on('update', updateVisualization);

d3.select("#categorySelector").on("change", function() {
    const selectedOptions = Array.from(this.selectedOptions).map(option => option.value);
    selectedCategories = selectedOptions.includes('all') ? 
        ['location', 'person', 'organization', 'miscellaneous'] : 
        selectedOptions;
    updateVisualization();
});

d3.select("#datasetSelector").on("change", function() {
    loadData(this.value);
});

loadData("WikiNews_sentiment.tsv");
