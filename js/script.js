const width = 800;
const height = 500;

// DOM selection and SVG injection
const svg = d3.select("canvas-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

//create label for the clustering zones: Safe, Suspicious, Illicit
const labelSafe = svg.append("text").attr("x",150).attr("y",50).attr("class","zone-label").text("Safe").attr("opacity",0).att("text-anchor", "middle");
const labelSuspicious = svg.append("text").attr("x",400).attr("y",50).attr("class","zone-label").text("Suspicious").attr("opacity",0).attr("text-anchor","middle");
const labelIllicit = svg.append("text").attr("x",650).attr("y",50).attr("y",50).attr("class", "zone-label").text("Illicit").attr("opacity",0).attr("text-anchor", "middle");

// definition color

function getNodeColor(riskLevel){
    if(riskLevel === "High") return "#ff3f34";
    if(riskLevel === "Medium") return "#ffd32a";
    if(riskLevel === "Low") return "#0be881";
    return "#808e9b";
}