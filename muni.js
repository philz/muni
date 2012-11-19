var TRANSITION_DELAY = 3000;

var muniColors = {
	'F': d3.rgb(223, 99, 98),
	'J': d3.rgb(197, 84, 39),
	'K': d3.rgb(59,148,176),
	'L': d3.rgb(115, 33, 100),
	'M': d3.rgb(19,151,71),
	'N': d3.rgb(15, 84, 183),
	'T': d3.rgb(216, 31, 38)
};


// Returns id of a vehicle; used for data joins.
function vehid(d) {
  return d.getAttribute("id");
}

// Setup SVG divs for ourselves.
var w = 1200,
    h = 1200;
// Project linearly from lat/long to x/y.  Theoretically we should
// be doing this non-linearly, but the area is small here.  We should
// also be adjusting w/h appropriately.
var latscale = d3.scale.linear().domain([37.815, 37.690]).range([0, w]);
var longscale = d3.scale.linear().domain([-122.520, -122.370]).range([0, h]);
var vis = d3.select("#map")
  .append("svg:svg")
  .attr("width", w)
  .attr("height", h);
var mapvis = vis.append("svg:g");
var munivis = vis.append("svg:g");

function drawmap(sfarterial) {
  // Draw base map of san francisco (the arterials)
  var path = d3.geo.path();
  path.projection(function linear(coordinates) { 
        x = longscale(coordinates[0]);
 	y = latscale(coordinates[1]);
	return [ x, y ];
  });
  var feature = mapvis.selectAll("path")
	  .data(sfarterial.features)
	  .enter().append("path");
  feature.attr("fill-opacity", 0.5);
  feature.attr("stroke", "#222")
  feature.attr("d", path);
}

function drawmuni(munidata) {
  // Draw muni data
  vehicles = munidata.getElementsByTagName('vehicle');

  vehPoints = munivis.selectAll(".vehPoint").data(vehicles, vehid);
  var triangle = d3.svg.symbol().type("triangle-up");
  var translation = function(d) {
    return "translate(" + longscale(d.getAttribute("lon")) + "," + latscale(d.getAttribute("lat")) + ")" +
           "rotate(" + d.getAttribute("heading") + ")" +
           "scale(1.3,2.4)" +
           "translate(0,-3)"; // stick it in the tail of the triangle
  };
  vehPoints.transition().duration(TRANSITION_DELAY)
         .attr("fill", function(d) {
		var tag = d.getAttribute("routeTag");
		return muniColors[tag] || "rgb(124,240,13)"
	 })
         .attr("transform", translation)
  vehPoints.enter()
      .append("svg:path")
         .attr("class", "vehPoint")
         .attr("transform", translation)
         .attr("d", triangle)
         .attr("fill", function(d) {
		var tag = d.getAttribute("routeTag");
		return muniColors[tag] || "rgb(124,240,13)"
	 })
         .attr("opacity", 0.0)
         .transition().duration(TRANSITION_DELAY)
         .attr("opacity", 0.5);
  vehPoints.exit().transition().duration(TRANSITION_DELAY)
	.attr("opacity", 0.0)
	.remove();

  vehLabels = munivis.selectAll(".vehLabel").data(vehicles, vehid);
  vehLabels.transition().duration(TRANSITION_DELAY)
	 .attr("y", function(d, i) { return latscale(d.getAttribute("lat")) + 4; })
	 .attr("x", function(d, i) { return longscale(d.getAttribute("lon")); })
         .text(function(d) { return d.getAttribute("routeTag"); });
  vehLabels.enter()
      .append("svg:text")
         .attr("class", "vehLabel")
         .attr("text-anchor", "middle")
         .attr("font-family", "sans-serif")
         .text(function(d) { return d.getAttribute("routeTag"); })
         .attr("font-size", "0px")
	 .attr("y", function(d, i) { return latscale(d.getAttribute("lat")) + 4; })
	 .attr("x", function(d, i) { return longscale(d.getAttribute("lon")); })
      .transition().duration(TRANSITION_DELAY)
         .attr("font-size", "11px");
  vehLabels.exit().transition().duration(TRANSITION_DELAY)
         .attr("font-size", "0px")
         .remove();
}

d3.json('stclines_arterial.geojson', drawmap);
d3.xml('http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&t=0', drawmuni);
// Reload muni data every 15s
setInterval(function() {
		d3.xml('http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&t=0', drawmuni);
}, 15000);
