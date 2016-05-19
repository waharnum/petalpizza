var cardData = [
{
    type: "context",
    title: "Device Platform",
    items: [
        "has no phone",
        "doesn't have a computer at all",
        "has a non-smartphone",
        "has an \"antiquated\" computer",
        "has a device with a small display",
        "has a modern computer",
        "has a smartphone",
        "has a device with a large display"
    ]
},
{
    type: "context",
    title: "Learning Management",
    items: [
        "self-directed arrangement",
        "constructive, collaborative arrangement",
        "instructor-faciliated arrangement"
    ]
}
];

var width = 960,
    height = 960,
    tau = 2 * Math.PI; // http://tauday.com/tau-manifesto

// An arc function with all values bound except the endAngle. So, to compute an
// SVG path string for a given angle, we pass an object with an endAngle
// property to the `arc` function, and it will return the corresponding string.
var backgroundArc = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(480);

var petalArc = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(430);

var petalLabelArc = d3.svg.arc()
    .innerRadius(430)
    .outerRadius(480);

// Create the SVG container, and apply a transform such that the origin is the
// center of the canvas. This way, we don't need to position arcs individually.
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


var background = svg.append("path")
    .datum({startAngle: 0, endAngle: tau})
    .style("fill", "#ddd")
    .attr("d", backgroundArc);

var initialStartAngle = 0;
var initialEndAngle = 0.16;
var angleStep = 0.16;
var petalCount = 0;

var getPetalColor = function (petalType) {
    if(petalType === "context") {
        return "coral";
    } else return "orange";
};

cardData.forEach (function (card) {


    var petal = svg.append("path")
        .datum({startAngle: initialStartAngle * tau, endAngle: initialEndAngle * tau})
        .attr("id", "petal-" + petalCount)
        .style("fill", getPetalColor(card.type))
        .style("stroke", "black")
        .attr("d", petalArc);

    var startInner = 390;
    var startOuter = 410;
    var layoutStep = 20;
    var layoutBandCount = 0;
    card.items.forEach(function (item) {

        var layoutArc = d3.svg.arc()
        .innerRadius(startInner)
        .outerRadius(startOuter);

        var layoutBand = svg.append("path")
        .datum({startAngle: initialStartAngle * tau, endAngle: initialEndAngle * tau})
        .style("fill", "none")
        .attr("id", "petal-" + petalCount + "-layout-band-" + layoutBandCount)
        .attr("d", layoutArc);

        var petalContent = svg.append("text")
            .attr("x", 8)
             .attr("dy", 0)
             .attr("font-family", "sans-serif")
             .attr("font-size", 12)
            .append("textPath")
             .attr("class", "textpath")
             .attr("spacing", "auto")
             .attr("method", "stretch")
             .attr("xlink:href", "#petal-" + petalCount + "-layout-band-" + layoutBandCount)
             .text("- " + item);


         startInner = startInner - layoutStep;
         startOuter = startOuter - layoutStep;
         layoutBandCount++;

    });

    var petalLabelArea = svg.append("path")
        .datum({startAngle: initialStartAngle * tau, endAngle: initialEndAngle * tau})
        .attr("id", "petalLabelArea-" + petalCount)
        .style("fill", "white")
        .style("stroke", "black")
        .attr("d", petalLabelArc);

    var petalLabel = svg.append("text")
        .attr("x", 8)
         .attr("dy", 28)
        .append("textPath")
         .attr("class", "textpath")
         .attr("xlink:href", "#petalLabelArea-" + petalCount)
         .text(card.title);

         initialStartAngle = initialStartAngle + angleStep;
         initialEndAngle = initialEndAngle + angleStep;
         petalCount++;

});

// Creates a tween on the specified transition's "d" attribute, transitioning
// any selected arcs from their current angle to the specified new angle.
function arcTween(transition, newAngle) {

  // The function passed to attrTween is invoked for each selected element when
  // the transition starts, and for each element returns the interpolator to use
  // over the course of transition. This function is thus responsible for
  // determining the starting angle of the transition (which is pulled from the
  // element's bound datum, d.endAngle), and the ending angle (simply the
  // newAngle argument to the enclosing function).
  transition.attrTween("d", function(d) {

    // To interpolate between the two angles, we use the default d3.interpolate.
    // (Internally, this maps to d3.interpolateNumber, since both of the
    // arguments to d3.interpolate are numbers.) The returned function takes a
    // single argument t and returns a number between the starting angle and the
    // ending angle. When t = 0, it returns d.endAngle; when t = 1, it returns
    // newAngle; and for 0 < t < 1 it returns an angle in-between.
    var interpolate = d3.interpolate(d.endAngle, newAngle);

    // The return value of the attrTween is also a function: the function that
    // we want to run for each tick of the transition. Because we used
    // attrTween("d"), the return value of this last function will be set to the
    // "d" attribute at every tick. (It's also possible to use transition.tween
    // to run arbitrary code for every tick, say if you want to set multiple
    // attributes from a single function.) The argument t ranges from 0, at the
    // start of the transition, to 1, at the end.
    return function(t) {

      // Calculate the current arc angle based on the transition time, t. Since
      // the t for the transition and the t for the interpolate both range from
      // 0 to 1, we can pass t directly to the interpolator.
      //
      // Note that the interpolated angle is written into the element's bound
      // data object! This is important: it means that if the transition were
      // interrupted, the data bound to the element would still be consistent
      // with its appearance. Whenever we start a new arc transition, the
      // correct starting angle can be inferred from the data.
      d.endAngle = interpolate(t);

      // Lastly, compute the arc path given the updated data! In effect, this
      // transition uses data-space interpolation: the data is interpolated
      // (that is, the end angle) rather than the path string itself.
      // Interpolating the angles in polar coordinates, rather than the raw path
      // string, produces valid intermediate arcs during the transition.
      return arc(d);
    };
  });
}
