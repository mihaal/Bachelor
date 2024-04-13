
let svg = d3.select("body")
    .append("svg")
    .attr("width", 500)
    .attr("height", 100)
    .style("background", "lightgrey")

let circle = svg.append("circle")
    .attr("cx", "50")
    .attr("cy", "50")
    .attr("r", "40")
    .style("fill", "blue")

let waitForMove = circle
    .transition()
    .duration(700)
    .attr("cx", "450")
    .attr("cy", "50")
    .end()

waitForMove.then(() => {
    circle
        .transition()
        .duration(700)
        .style("fill", "red")
})