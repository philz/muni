var TRANSITION_DELAY = 3000;

var munidata;
var sfarterial;

var muniColors = {
	'F': d3.rgb(223, 99, 98),
	'J': d3.rgb(197, 84, 39),
	'K': d3.rgb(59,148,176),
	'L': d3.rgb(115, 33, 100),
	'M': d3.rgb(19,151,71),
	'N': d3.rgb(15, 84, 183),
	'T': d3.rgb(216, 31, 38)
};

// The queue() in http://bl.ocks.org/4060606 seems super nice,
// but doesn't work given the expectations.  This stupidly
// waits for both callbacks.  Probably
// http://api.jquery.com/category/deferred-object/ is the right way to do this.
var cb1 = function(x) {
        munidata = x;
        if (sfarterial) {
                go(munidata, sfarterial);
        }
};
var cb2 = function(x) {
        sfarterial = x;
        if (munidata) {
                go(munidata, sfarterial);
        }
}

d3.xml('http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&t=0', cb1);
d3.json('stclines_arterial.geojson', cb2);

// Returns id of a vehicle; used for data joins.
function vehid(d) {
  return d.getAttribute("id");
}


// Setup SVG divs for ourselves.
var w = 1200,
    h = 1200;
var vis = d3.select("#map")
  .append("svg:svg")
  .attr("width", w)
  .attr("height", h);
var mapvis = vis.append("svg:g");
var munivis = vis.append("svg:g");

function go(munidata, sfarterial) {
  // Project linearly from lat/long to x/y.  Theoretically we should
  // be doing this non-linearly, but the area is small here.  We should
  // also be adjusting w/h appropriately.
  var latscale = d3.scale.linear().domain([37.815, 37.690]).range([0, w]);
  var longscale = d3.scale.linear().domain([-122.520, -122.370]).range([0, h]);

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

  // Draw muni data
  vehicles = munidata.getElementsByTagName('vehicle');

  vehPoints = munivis.selectAll(".vehPoint").data(vehicles, vehid);
  vehPoints.transition().duration(TRANSITION_DELAY)
         .attr("cy", function(d, i) { return latscale(d.getAttribute("lat")); })
         .attr("cx", function(d, i) { return longscale(d.getAttribute("lon")); })
         .attr("fill", function(d) {
		var tag = d.getAttribute("routeTag");
		return muniColors[tag] || "rgb(124,240,13)"
	 })
         .attr("r", 9);
  vehPoints.enter()
      .append("svg:circle")
         .attr("class", "vehPoint")
         .attr("cy", function(d, i) { return latscale(d.getAttribute("lat")); })
         .attr("cx", function(d, i) { return longscale(d.getAttribute("lon")); })
         .attr("fill", function(d) {
		var tag = d.getAttribute("routeTag");
		return muniColors[tag] || "rgb(124,240,13)"
	 })
         .attr("opacity", 0.5)
         .attr("r", 0).transition().duration(TRANSITION_DELAY).attr("r", 9);
  vehPoints.exit().transition().duration(TRANSITION_DELAY)
	.attr("r", 0)
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

  // Reload muni data every 15s
  setInterval(function() {
    d3.xml('http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&t=0', cb1);
  }, 15000);
}
