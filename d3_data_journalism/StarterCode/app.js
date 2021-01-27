var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 150,
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
var chosenYAxis = "healthcare"

function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
            d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
}
function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
            d3.max(data, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);
    return yLinearScale;
    }
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis])) 
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup; 
  }

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xlabel;
    if (chosenXAxis === "poverty") {
      xlabel = "In Poverty (%):";
    }
    else if (chosenXAxis === "age") {
      xlabel = "Age (Median):";
    }
    else if (chosenXAxis === "income") {
        xlabel = "Household Income (Median):"
    }
    var ylabel;
    if (chosenYAxis === "healthcare") {
      ylabel = "Lacks Healthcare (%):";
    }
    else if (chosenYAxis === "smokes") {
      ylabel = "Smokes (%):";
    }
    else if (chosenYAxis === "obesity") {
        ylabel = "Obese (%):"
    }
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
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
        sample.smokes = +sample.smokes;
        sample.obesity = +sample.obesity;
    });

    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis)

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", "20")
      .classed("stateCircle", true);

    var circleLabels = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .text(d => d.abbr)
        .classed("stateText", true);  
    
    var labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`);
      
    var povertyLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .attr("class", "axisText")
        .classed("active", true)
        .text("In Poverty (%)");
    var ageLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .attr("class", "axisText")
        .classed("inactive", true)
        .text("Age (Median)");
    var incomeLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .attr("class", "axisText")
        .classed("inactive", true)
        .text("Household Income (Median)");
    
    var labelsYGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
    
    var healthcareLabel = labelsYGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare")
        .attr("class", "axisText")
        .classed("active", true)
        .text("Lacks Healthcare (%)");
    var smokesLabel = labelsYGroup.append("text")
        .attr("y", 0 - margin.left + 60)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes")
        .attr("class", "axisText")
        .classed("inactive", true)
        .text("Smokes (%)");
    var obesityLabel = labelsYGroup.append("text")
        .attr("y", 0 - margin.left + 80)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity")
        .attr("class", "axisText")
        .classed("inactive", true)
        .text("Obese (%)");

    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    labelsXGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                chosenXAxis = value;
                xLinearScale = xScale(data, chosenXAxis);
                xAxis = renderXAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
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
                else if (chosenXAxis === "poverty") {
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
        labelsYGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {
                    chosenYAxis = value;
                    yLinearScale = yScale(data, chosenYAxis);
                    yAxis = renderYAxes(yLinearScale, yAxis);
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inacive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inacive", false);  
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);   
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);                                                  
                }
                else if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inacive", false); 
                    obesityLabel 
                        .classed("active", false)
                        .classed("inactive", true); 
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);                
                }
            }
        });
  }).catch(function(error) {
    console.log(error);
  });