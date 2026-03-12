let map = L.map('map').setView([20.5937,78.9629],5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
attribution:'© OpenStreetMap'
}).addTo(map);

let destinations=[];
let routeControl;


// ADD DESTINATION
function addDestination(){

let input=document.getElementById("destinationInput");

if(input.value===""){
alert("Enter destination");
return;
}

destinations.push(input.value);

updateList();

input.value="";

}


// UPDATE DESTINATION LIST
function updateList(){

let list=document.getElementById("destinationList");

list.innerHTML="";

destinations.forEach((d,i)=>{

let li=document.createElement("li");

li.innerHTML = `
${d}
<button class="removeBtn" onclick="removeDestination(${i})">❌</button>
`;

list.appendChild(li);

});

}


// REMOVE DESTINATION
function removeDestination(index){

destinations.splice(index,1);

updateList();

}


// CLEAR ALL DESTINATIONS
function clearDestinations(){

if(confirm("Clear all destinations?")){

destinations=[];
updateList();

}

}


// CLEAR START LOCATION
function clearStart(){

document.getElementById("startLocation").value="";

}


// RESET TRIP
function resetTrip(){

location.reload();

}


// GET COORDINATES FROM PLACE NAME
function getCoordinates(place){

// Fix for Vizag nickname
if(place.toLowerCase() === "vizag"){
place = "Visakhapatnam India";
}

return fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`)
.then(res=>res.json())
.then(data=>{

if(data.length===0){

alert("Location not found: "+place);
return null;

}

return{

lat:parseFloat(data[0].lat),
lon:parseFloat(data[0].lon)

};

});

}


// SHOW ROUTE
async function showRoute(){

let start=document.getElementById("startLocation").value;

if(start===""){
alert("Enter start location");
return;
}

if(destinations.length===0){
alert("Add destinations");
return;
}

let points=[];


// START LOCATION
let startCoord=await getCoordinates(start);

points.push(L.latLng(startCoord.lat,startCoord.lon));

L.marker([startCoord.lat,startCoord.lon])
.addTo(map)
.bindPopup("Start: "+start)
.openPopup();


// DESTINATIONS
let count=1;

for(let d of destinations){

let coord=await getCoordinates(d);

points.push(L.latLng(coord.lat,coord.lon));

L.marker([coord.lat,coord.lon])
.addTo(map)
.bindPopup("Destination "+count+": "+d);

count++;

}


// REMOVE OLD ROUTE
if(routeControl){
map.removeControl(routeControl);
}


// DRAW ROUTE
routeControl=L.Routing.control({

waypoints:points,
routeWhileDragging:true

}).addTo(map);


// DISTANCE + TIME
routeControl.on('routesfound', function(e){

let route=e.routes[0];

let distance=(route.summary.totalDistance/1000).toFixed(2);

let time=(route.summary.totalTime/3600).toFixed(2);

document.getElementById("distanceInfo").innerHTML=
"Total Distance: "+distance+" km";

document.getElementById("timeInfo").innerHTML=
"Total Time: "+time+" hours";

});


// JOURNEY SUMMARY

document.getElementById("startInfo").innerHTML=
"Start: "+start;

let destHTML="";

destinations.forEach((d,i)=>{

destHTML += `<p>Destination ${i+1}: ${d}</p>`;

});

document.getElementById("destinationInfo").innerHTML=destHTML;

}