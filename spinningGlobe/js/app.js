/*********** Adapted from http://bl.ocks.org/mbostock/4282586 **************/
var diameter = 560,
    radius = diameter >> 1,
    velocity = .01,
    then = Date.now();

var projection = d3.geo.orthographic()
    .scale(radius - 2)
    .translate([radius, radius])
    .clipAngle(90)
    .precision(0);

d3.select("body").selectAll(".title")
    .data(["Spinning Globe (λ, φ)"]).enter()
    .append("div")
    .attr("class", "title")
    .style("width", diameter + "px")
    .text(function(d) { return d; });

var worldContainer = d3.select(".title").append("div")
    .attr("class", "worldContainer");

var canvas = d3.select(".worldContainer").selectAll("canvas")
    .data([""]).enter()
    .append("canvas")
    .attr("width", diameter)
    .attr("height", diameter);

var path = d3.geo.path()
    .projection(projection);

d3.json("/data/world-110m.json", function(error, world) {
    if (error) throw error;

    var land = topojson.feature(world, world.objects.land),
      globe = {type: "Sphere"};

    d3.timer(function() {
        var angle = velocity * (Date.now() - then);
        var rotate = [0, 0, 0], context = canvas[0][0].getContext("2d");
        rotate[0] = angle, rotate[1] = -angle, projection.rotate(rotate);
        context.clearRect(0, 0, diameter, diameter);
        context.beginPath(), path.context(context)(land), context.fill();
        context.beginPath(), path(globe), context.stroke();
    }, 50);
});
/**************************************************************************/
