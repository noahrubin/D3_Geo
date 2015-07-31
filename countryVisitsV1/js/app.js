/************* Adapted from http://bl.ocks.org/mbostock/4183330 ***************/
var width = 960,
    height = 500;

var projection = d3.geo.orthographic()
    .scale(248)
    .clipAngle(90);

d3.select("body").selectAll(".title")
    .data(["Full World Tour"]).enter()
    .append("div")
    .classed("title", true)
    .text(function(d) { return d; });

d3.select("body").append("div")
    .classed("worldContainer", true);

d3.select(".worldContainer").append("h1");

var canvas = d3.select(".worldContainer").append("canvas")
    .attr("width", width)
    .attr("height", height);

var c = canvas.node().getContext("2d");

var path = d3.geo.path()
    .projection(projection)
    .context(c);

var title = d3.select("h1");

queue()
    .defer(d3.json, "../data/world-110m.json")
    .defer(d3.tsv, "../data/world-country-names.tsv")
    .await(ready);

function ready(error, world, names) {
  if (error) throw error;

  var globe = {type: "Sphere"},
      land = topojson.feature(world, world.objects.land),
      countries = topojson.feature(world, world.objects.countries).features,
      borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
      i = -1,
      n = countries.length;

  countries = countries.filter(function(d) {
    return names.some(function(n) {
      if (d.id == n.id) return d.name = n.name;
    });
  }).sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  (function transition() {
    d3.transition()
        .duration(1250)
        .each("start", function() {
          title.text(countries[i = (i + 1) % n].name);
        })
        .tween("rotate", function() {
          var p = d3.geo.centroid(countries[i]),
              r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
          return function(t) {
            projection.rotate(r(t));
            c.clearRect(0, 0, width, height);
            c.fillStyle = "#bbb", c.beginPath(), path(land), c.fill();
            c.fillStyle = "#f00", c.beginPath(), path(countries[i]), c.fill();
            c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
            c.strokeStyle = "#000", c.lineWidth = 2, c.beginPath(), path(globe), c.stroke();
          };
        })
        .transition()
        .each("end", transition);
  })();
}
/******************************************************************************/
