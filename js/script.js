const width = 800;
const height = 500;

const svg = d3.select("canvas-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const labelSafe = svg.append("text").attr("x",150).attr("y",50).attr("class","zone-label").text("Safe").attr("opacity",0).att("text-anchor", "middle");
const labelSuspicious = svg.append("text").attr("x",400).attr("y",50).attr("class","zone-label").text("Suspicious").attr("opacity",0).attr("text-anchor","middle");
