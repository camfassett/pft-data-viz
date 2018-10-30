/* global d3*/

//some global paramenters
var rectSize = 15
var paddingY = 5
var paddingX = 20
var width = 950
var height = 500
var aspect = width / height;
var globalData = null


//url where the CSV file is hosted
var dataurl = "https://pressfreedomtracker.us/all-incidents/export/";

//start d3 by selecting element with class .container look at index.html
var mainContainer = d3.select(".container");

//start by drawing a svg element on mainContainer
var svgcanvas = mainContainer.append("svg");

//start setting svg attributes
svgcanvas.attr("width", width)
         .attr("height", height)
         .attr("viewBox", `0 0 ${width} ${height}`)
         .attr("preserveAspectRatio","xMidYMid meet");


var tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("display", "none")

//fetching dataUrl and using d3.csv to parseCSV
d3.csv(dataurl).then((data) => {
  //processData parse raw data to d3 friendly data
  var filterData = globalData = processData(data);

  //create svg groups <g> element for each month
  //groups for every month, as groupData nest by month
  var monthGroup = svgcanvas.selectAll(".rects")
                            .data(groupData(filterData)) // groupData by month
                            .enter()
                            .append('g')
                            .attr("transform", (element, index) => `translate(${index*(rectSize + paddingX) + paddingX},${0})`)



  var events = monthGroup.selectAll('.event')
                         .data(d => d.values)

  var rectangles = events.enter()
                         .append("rect")
                         .attr("class", "rects")
                         .attr("class", (entry, index) => {
                           var cls = entry.categories[0]
                                          .replace('/', '')
                                          .split(' ')
                                          .join('-')
                                          .toLowerCase()
                           return cls;
                         })
                         .attr("x", 0) // 0 because monthGroup is translated on X
                         .attr("y", (e, index) => {
                           return index * (rectSize + paddingY)
                         })
                         .attr("width", rectSize)
                         .attr("height", rectSize)
                         .on('click', d => { // assign on click event for every event
                           window.open(d.slug, '_blank')
                         })
                         .on('mouseover', d => mouseover(d))
                         .on('mousemove', d => mousemove(d))
                         .on('mouseout', d => mouseout(d))

function mouseover(d){
  tooltip.style("display", "inline")
}
function mousemove(d) {
  tooltip
    .text(d.title)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY) + "px");
}

function mouseout() {
 tooltip.style("display", "none")
}
  // var rectangles = monthGroup
  //                        .append("rect")
  //                        .attr("class", "rects")
  //                        .attr("class", (data, index) => {
  //                          // console.log(data);
  //                          return "rects" + (index+1)
  //                        })
  //                        .attr("x", 0)
  //                        .attr("y", 0)
  //                        .attr("width", rectSize)
  //                        .attr("height", rectSize)
  //                        .append("text")

  var labels = monthGroup
                        .append("text")
                        .attr("y", - 25)
                        .text(data => data.actor)


});

//uses timeFormat to create commong string and
//d33.nest to group elements with common date string
function groupData(data){
  var timeFormat = d3.timeFormat("%m-%Y") //key based on date format month-year
  return d3.nest() ///then we nest/group all nodes with equal month-year
   .sortValues((a,b) => d3.descending(a.categories, b.categories))
   .key((ele) => timeFormat(ele.date))
   .entries(data)
}

function categories(data) {
  // filtering all unique categories
  const listCategories = [];
  for(let el in data){
    for(let cat in globalData[el].categories){
        let cg = globalData[el].categories[cat]
        cg = cg.trim()
        if(!listCategories.includes(cg)){
            listCategories.push(cg)
        }
    }
  }
  return listCategories;
}

function processData(data){
  //time Parser for date field
  var dateParser = d3.timeParse("%Y-%m-%d")
  //delete colum names row
  delete (data.columns)
  //go over all rows
  data.forEach(e => {
    //parse date field to js date Object like (new Date())
    e.date = dateParser(e.date)
    //convert list of categories, to array, using slip(',') -> ['categ1', 'categ2', ... ]
    e.categories = e.categories.split(',')
    // convert l,ist of involved politicias to array ['pol1', 'pol2', 'pol3' ...]
    e.politicians_or_public_figures_involved = e.politicians_or_public_figures_involved.split(',')
   })
  //return data sorting by the field element.date
  return data.sort((a,b) => a.date - b.date)
};


function d3resize() {
  var container = d3.select('.container');
  var targetWidth = parseInt(container.node().parentNode.clientWidth);
  var targetHeight = parseInt(container.node().parentNode.clientHeight);

  svgcanvas.attr('width', targetWidth);
  svgcanvas.attr('height', Math.round(targetWidth / aspect));
}
window.addEventListener('resize', d3resize);
d3resize()
