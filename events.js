//array to hold mappings where location in array relates to category where the value = # of events
var categoryInfos = [];
categoryInfos[19] = 0;
categoryMappings = [
    "Business",
    "Science&Tech",
    "Music",
    "Film&Media",
    "Arts",
    "F&B",
    "Health&Fitness",
    "Sports&Fitness",
    "T&O",
    "Food&Drink",
    "Charity&Causes",
    "Gov't",
    "Community",
    "R&S",
    "Family&Education",
    "S&H",
    "H&L",
    "A&B&A",
    "Hobbies",
    "Other"]
count = 0;
//function that gets data from Eventbrite's API
function getInfo() {
    var handleData = function(num) {
        return function(data) {
            categoryInfos[num - 1] = data.pagination.object_count;
            count += 1
            if (count == 20) {
                createCoolGraph(data);
            }
        };
    };
    for (i = 1; i < 20; i++) {
        text = "https://www.eventbriteapi.com/v3/events/search/?&token=RGS7WFGW7C7B645ARO7N&categories=" + (100 + i).toString();
        $.getJSON(text, handleData(i));
        //Takes too long to get the rest of the info per category so unfortunately I couldn't do fun
        //stuff with all of the info.
        //for (j = 2; j < 20; j++) {
        //    temp = text + "&page=" + j;
        //    $.getJSON(temp, function(i) {
        //        console.log("sjklzf");
        //        console.log(i);})
        //}
    }
    text = "https://www.eventbriteapi.com/v3/events/search/?categories=" + (199).toString();
    //token is the Eventbrite API token you must log in and ask for developer permissions to get your own
    text += "&" + token;
    $.getJSON(text, handleData(i));
}

getInfo();
var width = 1000, height = 1000;
var colors = [
    "blue",
    "gold",
    "green",
    "red",
    "mediumvioletred"];
//rgba colors for the tooltip, slight hack because had issues using default names
var rgbaColors = [
    "rgba(0, 0, 255, .7)",
    "rgba(255, 215, 0, .7)",
    "rgba(0, 128, 0, .7)",
    "rgba(255, 0, 0, .7)",
    "rgba(199, 21, 133, .7)"]

function createCoolGraph(data) {
    JSONInfo = createJSON(categoryInfos, categoryMappings);
    var pack = d3.layout.pack()
        .sort("ascending")
        .size([800, 800])
        .value(function(d) { return d.numEvents; })
        .padding(3);
    var packCalculations = pack.nodes(JSONInfo);
    //small hack because I was getting a giant circle in the back ground because of the hierarchy
    //of the JSON and the function I was using so I sliced it off because I did not want it.
    packCalculations = packCalculations.slice(1, packCalculations.length);
    console.log(packCalculations);
    var tooltip = d3.select("body")
       .append("div")
       .attr("class", "tooltip")
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .selectAll("g").data(packCalculations).enter()
    var g = svg.append("g")
    g.on("mouseover", function(d, i) {
        tooltip.text(d.numEvents + " events")
            .attr("fill", "black")
            .style("background", rgbaColors[i%5])
        return tooltip.style("visibility", "visible")})
    g.on("mouseout", function() {
        return tooltip.style("visibility", "hidden");})
    g.on("mousemove", function(){
        return tooltip.style("top", (event.pageY-10) + "px").style("left",(event.pageX+20)+"px");})
    g.append("circle")
        .attr("class", "circle")
        .attr("r", function(d) {return d.r})
        .style("fill-opacity", .4)
        .style("fill", function(d,i) {
            return colors[i%5];
        })
        .style("stroke", function(d, i) {
            return colors[i%5];
        })
        .attr("transform", function(d,i){return "translate(" + d.x + "," + d.y + ")"});
    g.append("text")
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .text(function(d) {return d.name})
        .attr("transform", function(d,i) {return "translate(" + d.x + "," + d.y + ")"});
}

//uses the mappings I got from the API calls to make a JSON relating # of events to their category name
function createJSON(data, categoryMappings) {
    var viewsJSONString = "{\"children\": [" ;
    for (var count=0; count<20; count++) {
        viewsJSONString +="{ \"name\": \"" + categoryMappings[count] + " \", \"numEvents\": "
                         + data[count] + " }   ";
        if (count<19)
            viewsJSONString += ",";
    }
    viewsJSONString += "]}"
    return JSON.parse(viewsJSONString);
}
