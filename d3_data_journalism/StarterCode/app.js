// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("data.csv").then(function(data) {
    console.log(data)
    data.forEach(function(sample) {
        sample.healthcare = +sample.healthcare;
        sample.poverty = +sample.poverty;
    });
    var xLinearScale = d3.scaleLinear()
    .domain([8, d3.max(data, d => d.poverty)])
    .range([0, width]);
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.healthcare)])
      .range([height, 0]);
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);
    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "15")
      .attr("label", data.abbr)
      .attr("fill", "blue")
      .attr("opacity", ".5");
    var circleLabels = chartGroup.selectAll(null).data(data).enter().append("text");

    circleLabels
        .attr("x", function(d) {
          return xLinearScale(d.poverty);
        })
        .attr("y", function(d) {
          return yLinearScale(d.healthcare);
        })
        .text(function(d) {
          return d.abbr;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .attr("fill", "white");

  })