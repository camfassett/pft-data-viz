/* global d3*/

//some global paramenters
var rectSize = 25
var padding = 5
var globalData = null


//url where the CSV file is hosted
var dataurl = "https://pressfreedomtracker.us/all-incidents/export/";

//start d3 by selecting element with class .container look at index.html
var mainContainer = d3.select(".container");

//start by drawing a svg element on mainContainer
var svgcanvas = mainContainer.append("svg");

//start setting svg attributes
svgcanvas.attr("width", "900")
         .attr("height", "600");

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
                            .attr("transform", (element, index) => `translate(${index*(rectSize + padding) + padding},${300})`)


  var events = monthGroup.selectAll('.event')
                         .data(d => d.values)

  var rectangles = events.enter()
                         .append("rect")
                         .attr("class", "rects")
                         .attr("class", (data, index) => {
                           // console.log(data);
                           return "rects" + (index+1)
                         })
                         .attr("x", 0)
                         .attr("y", (e, index) => {
                           return index * rectSize
                         })
                         .attr("width", rectSize)
                         .attr("height", rectSize)
                         .append("text")

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
  var timeFormat = d3.timeFormat("%m-%Y")
  return d3.nest()
   .key((ele) => timeFormat(ele.date))
   .entries(data)
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
