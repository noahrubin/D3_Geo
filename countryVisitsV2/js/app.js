// set globe canvas height and width
var canvasWidth = 960,
    canvasHeight = 500;

    // set h1 element for country name
var title = d3.select(".worldContainer")
                .append("h1"),
    // set projection (see: https://github.com/mbostock/d3/wiki/Geo-Projections)
    projection = d3.geo.orthographic()
                .scale(248)
                .clipAngle(90),
    // set access variables
    canvas = d3.select("canvas"), c, path,
    // countries selected to be in tour
    countries = [],
    // set globe type (see: https://github.com/mbostock/d3/wiki/Geo-Paths)
    globe = {type: "Sphere"},
    // set tour variables
    land, countryCoordinates, currentCountries, borders, i = -1, n
    // boolean to end tour if no countries selected
    touring = false;
// get data files like a Promise (see: https://github.com/mbostock/queue)
queue()
    .defer(d3.json, "../data/world-110m.json")
    .defer(d3.tsv, "../data/world-country-names.tsv")
    .await(setup);
// set onclick function for start tour button
d3.select("#tourStart")
    .on("click", startTour);

// called once data is loaded
function setup(error, world, names) {
    // extract data (see: https://github.com/mbostock/topojson)
    land = topojson.feature(world, world.objects.land),
    countryCoordinates = topojson.feature(world, world.objects.countries).features,
    borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
    i = -1;
    // sort name in alhpabetical order
    names = names.sort(function(a,b) { return a.name.localeCompare(b.name); });

    // set up dom with country selections
    var countrySelections = d3.select(".countryContainer")
        .selectAll(".country")
        .data(names)
        .enter()
        .append("div")
        .classed("country", true),
    countryText = countrySelections.append("p")
        .classed("countryName", true)
        .text(function(d) { return d.name; });
    countrySelections.on("click", clickedCountry);
}

function startTour() {
    // remove the old canvas and country text
    canvas.remove(), title.text(null), i = -1;
    // set new canvas
    canvas = d3.select(".worldContainer")
                .append("canvas")
                .attr("width", canvasWidth)
                .attr("height", canvasHeight),
    // get context of canvas (see: http://www.w3schools.com/tags/ref_canvas.asp)
    c = canvas
                .node()
                .getContext("2d"),
    // create the path with canvas context and orthographic projection
    path = d3.geo.path()
                .projection(projection)
                .context(c);

    if (countries.length > 0) {
        // we are now touring. yay!
        touring = true;
        // filter countries to be visited to only be ones selected
        currentCountries = countryCoordinates.filter(function(d) {
          return countries.some(function(n) {
            if (d.id == n.id) return d.name = n.name;
          });
        }).sort(function(a, b) {
          return a.name.localeCompare(b.name);
        });

        n = currentCountries.length;
        /* to attempt to understand this, see: http://bl.ocks.org/mbostock/4183330
                                          or https://news.ycombinator.com/item?id=4858817
        */
        (function transition() {
            if (touring === false) {
                title.text(null);
            }
            else {
                d3.transition()
                .duration(1250)
                .each("start", function() {
                    title.text(currentCountries[i = (i + 1) % n].name);
                })
                .tween("rotate", function() {
                    var p = d3.geo.centroid(currentCountries[i]),
                    r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                    return function(t) {
                        projection.rotate(r(t));
                        c.clearRect(0, 0, canvasWidth, canvasHeight);
                        c.fillStyle = "#bbb", c.beginPath(), path(land), c.fill();
                        c.fillStyle = "#f00", c.beginPath(), path(currentCountries[i]), c.fill();
                        c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
                        c.strokeStyle = "#000", c.lineWidth = 2, c.beginPath(), path(globe), c.stroke();
                    };
                })
                .transition()
                .each("end", transition);
            }
        })();
    }
    else {
        // if no countries selected, we are definitely not touring
        touring = false;
    }
}

function clickedCountry() {
    // set selected country div and country name
    var selection = d3.select(this),
        country = selection.data()[0];
    // if country not selected yet, make it look like it got selected
    // add country to tour list
    if (selection.style("opacity") !== "1") {
        selection
            .style("opacity", "1")
            .style("border-style", "solid")
            .style("border-color", "black");
        countries.push(country);
    }
    // otherwise make it look unselected
    // remove from countries list
    else {
        selection
            .style("opacity", ".4")
            .style("border-style", "dashed")
            .style("border-color", "gray");
        countries.some(function(elem, i) {
            if (elem.id === country.id) {
                countries.splice(i, 1);
                return true;
            }
            return false;
        });
    }
}
