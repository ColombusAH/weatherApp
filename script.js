var marker;
var infowindow;
var map;
const api_key = "c894fa26f98d61a6892f65d827493bef";

const data = {
  cities_info: [],
  countries_names: [],
  capitals: []
};
var cities_info;
var country_names;
var capitals;

const select_countries_element = document.querySelector("#countries");
const select_cities_element = document.querySelector("#cities");
const submit_button = document.querySelector("#submit");
// dictionary of the icons set by the weather mode
const icons = {
  internetError: "./assets/nointernet.png",
  Clear: "./assets/clear-day.png",
  Rain: "./assets/rain.png",
  Thunderstorm: "./assets/cloud.png",
  Clouds: "./assets/cloud.png",
  Dust: "./assets/cloud.png",
  Haze: "./assets/cloud.png",
  Snow: "./assets/snow.png"
};

// initial location set to jerusalem
let initial_center = {
  lat: 31.771959,
  lng: 35.217018
};

/**
 * desc: create a marker and positioning it by the coordinate parameter.
 * @param  coordinate : the coordinate to place a marker .
 */
async function setMarker(coordinate) {
  if (marker) {
    marker.setMap(null);
  }
  marker = new google.maps.Marker({
    animation: google.maps.Animation.DROP,
    map: map,
    position: coordinate
  });
  infowindow = new google.maps.InfoWindow({
    content: ""
  });
  marker.addListener("click", function(e) {
    infowindow.open(map, marker);
  });
  const content = await createContent(coordinate);
  infowindow.setContent(content);
  infowindow.open(map, marker);
}

/**
 * desc: create the content for the infowindow of the marker.
 * @param coordinate : the coordinate recieve by the user click.
 */
async function createContent(coordinate) {
  let data;

  try {
    let res = await fetch(
      `http://api.openweathermap.org/data/2.5/weather?lat=${
        coordinate.lat
      }&lon=${coordinate.lng}&units=metric&APPID=${api_key}`
    );
    res = await res.json();
    data = {
      city: res.name,
      temp: res.main.temp,
      humidity: res.main.humidity,
      desc: res.weather[0].main
    };
  } catch (error) {
    console.log(error);
    data = {
      city: "No internet Connection?",
      temp: "",
      humidity: "",
      desc: "internetError"
    };
  } finally {
    return `<div class="div--card">
            <img class="img--weather_icon" src="${icons[data.desc]}" alt="icon">
            <div class="container--data">
                <h1 class="div__h1--city">${data.city}</h1>
                <span><b>Temp</b>:  ${data.temp} &#8451;</span>
                <span><b>Humidity</b>:  ${data.humidity} % </span>
            </div>
        </div>`;
  }
}

/**
 * desc: init the map object and set a default marker.
 */
function initMap() {
  map = new google.maps.Map(document.querySelector("#map"), {
    center: initial_center,
    zoom: 8
  });
  setMarker(initial_center);
  map.addListener("click", async function(e) {
    const coordinate = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setMarker(coordinate);
  });
}

/**
params: file_name : the name of the file.
desc: fet data from file and set it to data object
 */
async function getDataFromFile(file_name) {
  try {
    data[file_name] = await fetch(`./data/${file_name}.json`);
    data[file_name] = await data[file_name].json();
  } catch (error) {
    console.log(error);
  }
};

/**
params: initialSelect : initial input for selecting
desc: set the ddlist for countries
 */
function setCountriesNames(initalSelect) {
  _.each(data.countries_names, country => {
    select_countries_element.options[
      select_countries_element.length
    ] = new Option(country.name, country.code);
    if (
      select_countries_element.options[select_countries_element.length - 1]
        .value === initalSelect
    ) {
      select_countries_element.options[
        select_countries_element.length - 1
      ].selected = true;
    }
  });
}

/**
params: country_code : code of selected country
desc: set the ddlist for citie vy the country_code
 */
function setCitiesByCountryCode(country_code) {
  const cities = _.filter(data.cities_info, ["country", country_code]);
  _.each(cities, city => {
    select_cities_element.options[select_cities_element.length] = new Option(
      city.name,
      city.name
    );
  });
}

/**

desc: get the data and place a marker
 */
submit_button.addEventListener("click", () => {
  const city_name = select_cities_element.value;
  const city = _.find(data.cities_info, ["name", city_name]);
  const coordinate = {
    lat: city.coord.lat,
    lng: city.coord.lon
  };

  setMarker(coordinate);
});

/**

desc: recenter the map for the user !!!
 */

select_countries_element.addEventListener("change", () => {
  const country_name = select_countries_element[select_countries_element.selectedIndex].text;
  const capital_city = _.find(data.capitals, ['country', country_name]);
  const city_info = _.find(data.cities_info, ['name', capital_city.city]);

  const latLng = new google.maps.LatLng(city_info.coord.lat, city_info.coord.lon);
  map.setCenter(latLng);
  setCitiesByCountryCode(city_info.country);
  select_cities_element.value = capital_city.city;
});

/**

desc: initializing
 */
window.onload = async function() {
  [await getDataFromFile('cities_info'), await getDataFromFile('countries_names'), await getDataFromFile('capitals')];
  setCitiesByCountryCode("IL");
  setCountriesNames("IL");
  select_cities_element.value = "Jerusalem";
};
