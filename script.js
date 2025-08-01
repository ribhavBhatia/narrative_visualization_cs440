var svg = d3.select("svg");                         // Select the <svg> element from index.html
var width = 800;                                    // Width of SVG canvas (matches viewBox)
var height = 500;                                   // Height of SVG canvas
var margin = { top: 50, right: 50, bottom: 50, left: 80 }; // Space around chart edges
var innerWidth = width - margin.left - margin.right;    
var innerHeight = height - margin.top - margin.bottom;


// Global state to track scene and store data -- Not sure what it is used for yet
let state = {
    scene: 1,
    data: [],
    selectedMake: null
  };


d3.csv("cars_2017.csv").then(function(data) {
    // Convert strings to numbers for relevant fields
    data.forEach(d => {
        d.EngineCylinders = +d.EngineCylinders;       
        d.AverageHighwayMPG = +d.AverageHighwayMPG;
        d.AverageCityMPG = +d.AverageCityMPG;
    });
  
    state.data = data;      // Store cleaned data in state
    renderScene1();         // Start with the first scene
});


function renderScene1() {
    // Clear anything currently in the SVG
    console.log("Rendering Scene 1...");
    svg.selectAll("*").remove();
  
    d3.select("#scene-title").text("MPG vs Fuel Type"); // update title

    // Create a group for the chart area with margins applied
    var group = svg.append("g")
      .attr("transform", "translate("+80+","+50+")");
  
    // Group data by Fuel and calculate average highway MPG
    var mpgByFuel = d3.rollup(
      state.data,
      v => d3.mean(v, d => d.AverageHighwayMPG),
      d => d.Fuel
    );
  
    var fuels = Array.from(mpgByFuel.keys());
    var values = Array.from(mpgByFuel.values());
  
    // Creating the scales for the bar chart
    var x = d3.scaleBand()
      .domain(fuels)
      .range([0, innerWidth])
      .padding(0.2);            //Used to seperate space between the axis and the data
  
    var y = d3.scaleLinear()
      .domain([0, d3.max(values)])
      .nice()                   //used to round up the axis numbers
      .range([innerHeight, 0]);
  
    
    // Creating axes
    group.append("g").call(d3.axisLeft(y));
  
    group.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x));
    

    // Y-axis label
    group.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Average Highway MPG");
    
    // X-axis label
    group.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Fuel Type");

    // draw the bars
    group.selectAll("rect")
      .data([...mpgByFuel])
      .enter()
      .append("rect")
      .attr("x", d => x(d[0]))
      .attr("y", d => y(d[1]))
      .attr("width", x.bandwidth())
      .attr("height", d => innerHeight - y(d[1]))
      .attr("fill", "steelblue");
  
    group.append("text")
      .attr("x", 150)
      .attr("y", -10)
      .attr("class", "annotation")
      .text("Electric vehicles have the highest average highway MPG");
    
  }


function renderScene2() {
    console.log("Rendering Scene 2...");
    svg.selectAll("*").remove(); 

    d3.select("#scene-title").text("Hwy MPG vs Engine Cylinders"); 

    var group = svg.append("g")
        .attr("transform", "translate("+80+","+50+")");
    
    var x = d3.scaleLinear()
        .domain(d3.extent(state.data, d => d.EngineCylinders))
        .range([0, innerWidth])
        .nice();
  
    var y = d3.scaleLinear()
        .domain(d3.extent(state.data, d => d.AverageHighwayMPG))
        .range([innerHeight, 0])
        .nice();
    
    var color = d3.scaleOrdinal()
        .domain(["Gasoline", "Diesel", "Electricity"])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 150}, ${margin.top})`);
    
    var tooltip = d3.select("#tooltip");
    // Creating axes
    group.append("g").call(d3.axisLeft(y));
  
    group.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x));
    

    // Y-axis label
    group.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Average Highway MPG");
    
    // X-axis label
    group.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Engine Cylinders");

    // The circles for the Scatter Plot
    group.selectAll("circle")
        .data(state.data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.EngineCylinders))
        .attr("fill", d => color(d.Fuel))
        .attr("opacity", 0.7)
        .attr("stroke", "black")               
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
            tooltip
              .style("display", "block")
              .html(`
                <strong>${d.Make}</strong><br/>
                Fuel: ${d.Fuel}<br/>
                Cylinders: ${d.EngineCylinders}<br/>
                Hwy MPG: ${d.AverageHighwayMPG}<br/>
                Cty MPG: ${d.AverageCityMPG}
              `);
            d3.select(this).attr("stroke-width", 2);
          })
          .on("mousemove", event => {
            tooltip
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 20) + "px");
          })
          .on("mouseout", function() {
            tooltip.style("display", "none");
            d3.select(this).attr("stroke-width", 1);
          })
        .transition()
        .duration(1000)
        .delay(200)
        .attr("cy", d => y(d.AverageHighwayMPG))
        .attr("r", 5);
    
    const fuels = color.domain();

    legend.selectAll("rect")
        .data(fuels)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 25)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => color(d));
    
    legend.selectAll("text")
        .data(fuels)
        .enter()
        .append("text")
        .attr("x", 30)
        .attr("y", (d, i) => i * 25)
        .text(d => d)
        .attr("font-size", "14px")
        .attr("alignment-baseline", "middle");
    
    group.append("text")
        .attr("x", 150)
        .attr("y", -10)
        .attr("class", "annotation")
        .text("As the number of Cylinders increases the Average Hwy MPG decreases");


}



function renderScene3() {

    console.log("Rendering Scene 3...");
    svg.selectAll("*").remove();

    d3.select("#scene-title").text("City MPG vs Engine Cylinders by Make");

    d3.select("#make-select").style("display", "inline");

    var group = svg.append("g")
        .attr("transform", "translate("+80+","+50+")");
    
    var x = d3.scaleLinear()
        .domain(d3.extent(state.data, d => d.AverageHighwayMPG))
        .range([0, innerWidth])
        .nice();
  
    var y = d3.scaleLinear()
        .domain(d3.extent(state.data, d => d.AverageCityMPG))
        .range([innerHeight, 0])
        .nice();
    
    var color = d3.scaleOrdinal()
        .domain(["Gasoline", "Diesel", "Electricity"])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 150}, ${margin.top})`);
    
    var tooltip = d3.select("#tooltip");

    // Creating axes
    group.append("g").call(d3.axisLeft(y));
  
    group.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x));
    

    // Y-axis label
    group.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Average City MPG");
    
    // X-axis label
    group.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Average Hwy MPG");

    var makes = Array.from(new Set(state.data.map(d => d.Make))).sort();
    var select = d3.select("#make-select");
    
    select.selectAll("option").remove();
    makes.forEach(make => {
        select.append("option").text(make).attr("value", make);
    });

    function updateScatter(selectedMake) {
        var filtered = state.data.filter(d => d.Make === selectedMake);
    
        var create = group.selectAll("circle")
            .data(filtered, d => d.Make + d.EngineCylinders + d.AverageHighwayMPG +d.AverageCityMPG)
        create.exit().remove()
        create.enter()
            .append("circle")
            .attr("cx", d => x(d.AverageHighwayMPG))
            .attr("fill", d => color(d.Fuel))
            .attr("opacity", 0.7)
            .attr("stroke", "black")               
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
                tooltip
                .style("display", "block")
                .html(`
                    <strong>${d.Make}</strong><br/>
                    Fuel: ${d.Fuel}<br/>
                    Cylinders: ${d.EngineCylinders}<br/>
                    Hwy MPG: ${d.AverageHighwayMPG}<br/>
                    Cty MPG: ${d.AverageCityMPG}
                `);
                d3.select(this).attr("stroke-width", 2);
            })
            .on("mousemove", event => {
                tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("display", "none");
                d3.select(this).attr("stroke-width", 1);
            })
            .transition()
            .duration(1000)
            .delay(200)
            .attr("cy", d => y(d.AverageCityMPG))
            .attr("r", 5);
        create.exit().remove()
            

    }

    updateScatter(makes[0]);

    select.on("change", function() {
        updateScatter(this.value);
    });
    
    
    const fuels = color.domain();

    legend.selectAll("rect")
        .data(fuels)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 25)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => color(d));
    
    legend.selectAll("text")
        .data(fuels)
        .enter()
        .append("text")
        .attr("x", 30)
        .attr("y", (d, i) => i * 25)
        .text(d => d)
        .attr("font-size", "14px")
        .attr("alignment-baseline", "middle");
    
    group.append("text")
    .attr("x", 150)
    .attr("y", -10)
    .attr("class", "annotation")
    .text("Electric Cars typically have higher MPG's");

    

}


window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("next").addEventListener("click", () => {
      state.scene += 1;
  
      if (state.scene === 2) renderScene2();
      else if (state.scene === 3) renderScene3();
      else console.log("Scene", state.scene);
    });

    document.getElementById("back").addEventListener("click", () => {
        state.scene -= 1;
    
        if (state.scene !== 3) d3.select("#make-select").style("display", "none");

        if (state.scene === 1) renderScene1();
        else if (state.scene === 2) renderScene2(); 
        else console.log("Scene", state.scene);
      });
});