const width = 800;
const height = 600;

const svg = d3.select("#canvas-container")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
   
// Zonas (Seguro, Sospechoso, Ilícito)
const labelSafe = svg.append("text").attr("x", 150).attr("y", 50).attr("class", "zone-label").text("законый").attr("opacity", 0).attr("text-anchor", "middle");
const labelSuspicious = svg.append("text").attr("x", 400).attr("y", 50).attr("class", "zone-label").text("Неизвестный").attr("opacity", 0).attr("text-anchor", "middle");
const labelIllicit = svg.append("text").attr("x", 650).attr("y", 50).attr("class", "zone-label").text("незаконый").attr("opacity", 0).attr("text-anchor", "middle");

function getNodeColor(riskLevel){
    if(riskLevel === "High") return "#ff3f34";
    if(riskLevel === "Medium") return "#ffd32a";
    if(riskLevel === "Low") return "#0be881";
    return "#808e9b";
}

let simulation, nodes;


d3.json("/Data/data.json").then(function(data) {
   
    // 1. DIBUJAR BURBUJAS (Sin textos)
    nodes = svg.selectAll("circle")  
        .data(data)                  
        .enter()                    
        .append("circle")
        .attr("class", "node")     
        .attr("r", 12) 
        .attr("fill", d => getNodeColor(d.risk)); 

    // 2. MOTOR FÍSICO
    simulation = d3.forceSimulation(data)
        .force("centerX", d3.forceX(width/2).strength(0.05)) 
        .force("centerY", d3.forceY(height / 2).strength(0.05))
        .force("collide", d3.forceCollide(d => Math.max(8, d.amount / 5000) + 2))
        .on("tick", function(){
            
            nodes
                .attr("cx", d => d.x)
                .attr("cy", d=> d.y);
        });

    // 3. DATOS SECUNDARIOS: Contar frecuencias
    const counts = d3.rollups(data, v => v.length, d => d.risk)
        .map(([key, value]) => ({ risk: key, count: value }));
        
    drawBarChart(counts);
    drawPieChart(counts);
    drawMap(data);

}).catch(function(error) {
    console.error("❌ ERROR LEYENDO EL JSON:", error);
    alert("Revisa la consola. D3 no encuentra la ruta Data/data.json");
});

// FUNCIONES INTERACTIVAS
window.groupByRisk = function() {
    d3.selectAll(".zone-label").transition().duration(800).attr("opacity", 1);
    
    simulation.force("centerX", d3.forceX(function(d) {
        if (d.risk === "High") return 650;   
        if (d.risk === "Medium") return 450; 
        if (d.risk === "Low") return 150;    
    }).strength(0.1)); 
    
    simulation.alpha(1).restart(); 
};

window.mixAll = function() {
    d3.selectAll(".zone-label").transition().duration(500).attr("opacity", 1);
    simulation.force("centerX", d3.forceX(width / 2).strength(0.05));
    simulation.alpha(1).restart();
};

// GRÁFICO DE BARRAS
function drawBarChart(dataSummary) {
    const bWidth = 380, bHeight = 250;
    const margin = {top: 30, right: 20, bottom: 40, left: 50};

    const svgBar = d3.select("#bar-chart-container")
        .append("svg")
        .attr("width", bWidth)
        .attr("height", bHeight);

    const x = d3.scaleBand()
        .domain(["Low", "Medium", "High"])
        .range([margin.left, bWidth - margin.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(dataSummary, d => d.count)]).nice()
        .range([bHeight - margin.bottom, margin.top]);

    svgBar.selectAll("rect")
        .data(dataSummary)
        .enter().append("rect")
        .attr("x", d => x(d.risk))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => (bHeight - margin.bottom) - y(d.count))
        .attr("fill", d => getNodeColor(d.risk));

    svgBar.selectAll(".bar-label")
        .data(dataSummary)
        .enter().append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.risk) + x.bandwidth() / 2)
        .attr("y", d => y(d.count) - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("fill", "white")
        .text(d => d.count);

    svgBar.append("g")
        .attr("transform", `translate(0,${bHeight - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d => d === "High" ? "незаконный" : d === "Medium" ? "Неизвестный" : "законный"));
        
    svgBar.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5));
}

// GRÁFICO DE TORTA
function drawPieChart(dataSummary) {
    const pWidth = 380, pHeight = 250, radius = Math.min(pWidth, pHeight) / 2 - 20;

    const svgPie = d3.select("#pie-chart-container")
        .append("svg")
        .attr("width", pWidth)
        .attr("height", pHeight)
        .append("g")
        .attr("transform", `translate(${pWidth / 2}, ${pHeight / 2})`);

    const pie = d3.pie().value(d => d.count);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    svgPie.selectAll("path")
        .data(pie(dataSummary))
        .enter().append("path")
        .attr("d", arc)
        .attr("fill", d => getNodeColor(d.data.risk))
        .attr("stroke", "#f5f6fa")
        .style("stroke-width", "2px");

    svgPie.selectAll("text")
        .data(pie(dataSummary))
        .enter().append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#000") // Texto negro para legibilidad
        .text(d => {
            const total = d3.sum(dataSummary, d => d.count);
            return ((d.data.count / total) * 100).toFixed(1) + "%";
        });
}

function drawMap(data) {
    const mapWidth = 500;
    const mapHeight = 300;

    const svgMap = d3.select("#map-container")
        .append("svg")
        .attr("viewBox", `0 0 ${mapWidth} ${mapHeight}`)
        .style("width", "100%")
        .style("height", "100%");

    const projection = d3.geoMercator()
        .scale(70) 
        .center([0, 20])
        .translate([mapWidth/2, mapHeight/2]);
        
    const path = d3.geoPath().projection(projection);

    // Diccionario de coordenadas en tierra firme (Lon, Lat)
    const landCoords = {
        'Low': [[8, 46], [-95, 37], [103, 1], [138, 36]], // Suiza, USA, Singapur, Japón
        'Medium': [[20, 48], [78, 20], [115, -1], [-55, -10]], // Europa central, India, Indonesia, Brasil
        'High': [[55, 25], [15, 15], [-75, 10], [100, 15]] // Zonas de riesgo identificadas
    };

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(topo) {
        svgMap.append("g")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "#718093") 
            .attr("stroke", "#2f3640") 
            .attr("stroke-width", 0.5);

        svgMap.append("g")
            .selectAll("circle")
            .data(data) 
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                // Selecciona una ubicación de tierra firme basada en el riesgo
                const spots = landCoords[d.risk] || [[0,0]];
                const base = spots[Math.floor(Math.random() * spots.length)];
                // Añade un pequeño margen de error para que los puntos no se encimen
                const lon = base[0] + (Math.random() * 6 - 3);
                d.finalLon = lon; 
                d.finalLat = base[1] + (Math.random() * 6 - 3);
                return projection([d.finalLon, d.finalLat])[0];
            })
            .attr("cy", d => projection([d.finalLon, d.finalLat])[1])
            .attr("r", 4) 
            .attr("fill", d => getNodeColor(d.risk)) 
            .attr("opacity", 0.8) 
            .attr("stroke", "#1e272e") 
            .attr("stroke-width", 1);
    });
}