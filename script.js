// Load the CSV data
d3.csv('data.csv').then(data => {
    // Convert string values to numbers
    data.forEach(d => {
        d.value = +d.value;
    });

    // Create Chart.js Pie Chart
    createPieChart(data);
    
    // Create D3.js Bar Graph
    createBarGraph(data);
});

function createPieChart(data) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.category),
            datasets: [{
                data: data.map(d => d.value),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Data Distribution'
                }
            }
        }
    });
}

function createBarGraph(data) {
    // Set dimensions
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = 460 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select("#barGraph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .range([height, 0]);

    // Set domains
    x.domain(data.map(d => d.category));
    y.domain([0, d3.max(data, d => d.value)]);

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Add Y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.category))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.value))
        .attr("height", d => height - y(d.value));
}
