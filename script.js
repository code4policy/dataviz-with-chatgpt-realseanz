// Load the CSV file and visualize the data
d3.csv("boston_311_2023_by_reason.csv").then(data => {
    // Process and clean data
    const parsedData = data.map(d => ({
        reason: d.reason,
        count: +d.Count // Convert "Count" to a number
    }));

    // Sort data and get the top 10 reasons
    const top10Data = parsedData.sort((a, b) => b.count - a.count).slice(0, 10);

    // Set chart dimensions and margins
    const margin = { top: 100, right: 100, bottom: 100, left: 200 }; // Adjusted left margin for long labels
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(top10Data, d => d.count)])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(top10Data.map(d => d.reason))
        .range([0, height])
        .padding(0.1);

    // Add axes
    const yAxis = svg.append("g")
        .call(d3.axisLeft(y).tickSize(0));

    yAxis.selectAll("text")
        .style("font-family", "Times New Roman")
        .style("font-size", "14px")
        .call(wrapText, 180); // Call wrapText function for labels

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5))
        .selectAll("text")
        .style("font-family", "Times New Roman")
        .style("font-size", "14px");

    // Draw bars
    svg.selectAll(".bar")
        .data(top10Data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.reason))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(d.count))
        .on("mouseover", function () {
            d3.select(this).transition().duration(200).style("fill", "#ff7f50");
        })
        .on("mouseout", function () {
            d3.select(this).transition().duration(200).style("fill", "#4682b4");
        });

    // Add labels on bars (moved to the right of the bar)
    svg.selectAll(".label")
        .data(top10Data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("y", d => y(d.reason) + y.bandwidth() / 2)
        .attr("x", d => x(d.count) + 5) // Move labels slightly to the right of the bar
        .attr("dy", ".35em")
        .style("font-family", "Times New Roman")
        .style("font-size", "14px")
        .text(d => d.count);

    // Function to wrap text for long labels
    function wrapText(text, width) {
        text.each(function () {
            const text = d3.select(this);
            const words = text.text().split(/\s+/).reverse();
            let line = [];
            let lineNumber = 0;
            const lineHeight = 1.1; // ems
            const y = text.attr("y");
            const dy = parseFloat(text.attr("dy")) || 0;
            let tspan = text.text(null)
                .append("tspan")
                .attr("x", -10) // Adjust position slightly for left alignment
                .attr("y", y)
                .attr("dy", `${dy}em`);

            while (words.length > 0) {
                line.push(words.pop());
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [words.pop()];
                    tspan = text.append("tspan")
                        .attr("x", -10)
                        .attr("y", y)
                        .attr("dy", `${++lineNumber * lineHeight + dy}em`)
                        .text(line.join(" "));
                }
            }
        });
    }
});
