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

var chosenXAxis = "poverty";

function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
            d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
}
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis])); 
    return circlesGroup;
  }
function updateToolTip(chosenXAxis, circlesGroup) {
    var label;
    if (chosenXAxis === "poverty") {
      label = "In Poverty (%):";
    }
    else if (chosenXAxis === "age") {
      label = "Age (Median):";
    }
    else if (chosenXAxis === "income") {
        label = "Household Income (Median)"
    }
  
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

    chartGroup.call(toolTip);  
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });
    return circlesGroup;
}
    
d3.csv("data.csv").then(function(data) {
    console.log(data)
    data.forEach(function(sample) {
        sample.healthcare = +sample.healthcare;
        sample.poverty = +sample.poverty;
        sample.age = +sample.age;
        sample.income = +sample.income;
    });

    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.healthcare)])
      .range([height, 0]);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "20")
      .classed("stateCircle", true);

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
        .classed("stateText", true);  
    
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`);
    
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Lacks Healthcare (%)");
      
    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .attr("class", "axisText")
        .classed("active", true)
        .text("In Poverty (%)");
    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .attr("class", "axisText")
        .classed("inactive", true)
        .text("Age (Median)");
    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .attr("class", "axisText")
        .classed("inactive", true)
        .text("Household Income (Median)");
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    labelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                chosenXAxis = value;
                xLinearScale = xScale(data, chosenXAxis);
                xAxis = renderAxes (xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inacive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }
                else if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inacive", false);  
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);   
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);                                                  
                }
                else {
                    povertyLabel
                        .classed("active", true)
                        .classed("inacive", false); 
                    incomeLabel 
                        .classed("active", false)
                        .classed("inactive", true); 
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);                
                }
            }
        });
  }).catch(function(error) {
    console.log(error);
  });