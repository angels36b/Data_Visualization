const width = 800;
const height = 500;

// DOM selection and SVG injection
const svg = d3.select("#canvas-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

//create label for the clustering zones: Safe, Suspicious, Illicit
const labelSafe = svg.append("text").attr("x",150).attr("y",50).attr("class","zone-label").text("Safe").attr("opacity",0).attr("text-anchor", "middle");
const labelSuspicious = svg.append("text").attr("x",400).attr("y",50).attr("class","zone-label").text("Suspicious").attr("opacity",0).attr("text-anchor","middle");
const labelIllicit = svg.append("text").attr("x",650).attr("y",50).attr("y",50).attr("class", "zone-label").text("Illicit").attr("opacity",0).attr("text-anchor", "middle");

// definition color

function getNodeColor(riskLevel){
    if(riskLevel === "High") return "#ff3f34";
    if(riskLevel === "Medium") return "#ffd32a";
    if(riskLevel === "Low") return "#0be881";
    return "#808e9b";
}

let simulation, nodes;

//Upload a JSON file with transaction data and draw circles on teh SVG,
//one for each transaction, sized according to the amount and colored according to the level 
//of risk
//загружает файл JSON с данными транзакции и рисует круги и SVG ПО ОДНОМУ
//ДЛЯ КАЖДОЙ ТРАНЗАКЦИИ, РАЗМЕРОМ В ЗАВИСИМОСТИ ОТ СУММЫ И ЦВЕТОМ В ЗАВИСИМОСТИ ОТ УРОВНЯ РИСКА

d3.json("Data/data.json").then(function(data) {
   
    nodes = svg.selectAll("circle")  //select circle 
        .data(data)                  //link the data
        .enter()                    
        .append("circle")
        .attr("class", "node")     //class to style
        .attr("r", d=> Math.max(8, d.amount /5000)) //radio:mayo
        .attr("fill", d => getNodeColor(d.risk)); //color segun el nivel de riesgo
    
    const nodeLabels = svg.selectAll(".id-label")
        .data(data)
        .enter()   //обнаруживает, что данные не имеют связанного элемента/ detect that data does not have an associated element
        .append("text")     //creates a new element for each data
        .attr("class", "id-label")
        .text(d=> d.id) //relation the ID
        .attr("text-anchor", "middle") //we center the text /мы центрируем текст
        .attr("dy", -15) // смещаем текст вверх на 15 пикселей
        .style("font-size", "12px")
        .style("fill", "#ffffff") // Texto blanco para que contraste
        .style("pointer-events", "none"); // Para que el ratón no interfiera



//create phisic engine  
// создает физический движок, который непрерывно перемещает круги (узлы) 
    simulation = d3.forceSimulation(data)
    //Притягивает узлы к горизонтальному центру
    //attract the nodes towards the horizontal center
        .force("centerX", d3.forceX(width/2).strength(0.05)) //запустите физический движок
        .force("centerY",d3.forceY(height / 2).strength(0.05))
    //it prevents the circles from overlapping
        .force("collide", d3.forceCollide(d => Math.max(8, d.amount / 5000) + 2))
    //Предотвращает перекрытие кругов
        .on("tick", function(){
            nodes
                .attr("cx", d => d.x)
                .attr("cy", d=> d.y);

            nodeLabels
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        })
    }

) 
.catch(function(error) {
    // Si el JSON falla, esto lo imprimirá en rojo gigante en la consola
    console.error("❌ ERROR LEYENDO EL JSON:", error);
    alert("Hubo un error al leer data.json. Revisa la consola.");
});


// 6. Interactive Functions
window.groupByRisk = function() {

    d3.selectAll(".zone-label").transition().duration(800).attr("opacity", 1);
    
    simulation.force("centerX", d3.forceX(function(d) {
        if (d.risk === "High") return 650;   
        if (d.risk === "Medium") return 400; 
        if (d.risk === "Low") return 150;    
    }).strength(0.1)); 
    
    simulation.alpha(1).restart(); 
};

window.mixAll = function() {
    d3.selectAll(".zone-label").transition().duration(500).attr("opacity", 0);
    simulation.force("centerX", d3.forceX(width / 2).strength(0.05));
    simulation.alpha(1).restart();
};
  


/**/