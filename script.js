const modelInp = document.getElementById("model-inp");
const aircraftsDropdown = document.getElementById('aircrafts-dropdown');
const stdLength = document.getElementById("std-length");
const elevation = document.getElementById("elevation");
const tempAvgMean = document.getElementById("temp_avg_mean");
const tempMaxMean = document.getElementById("temp_max_mean");
const effGraddient = document.getElementById("effective_gradient");
const ARTelm = document.getElementById("ART");
const correctedLength = document.getElementById("correctedLength");
const submitBtn = document.getElementById("submit");
const moreInfoBtn = document.getElementById('more-info')
const countriesDropdown = document.getElementById("countries-dropdown");
const citiesDropdown = document.getElementById("cities-dropdown");
const weatherInfoSpan = document.getElementById('weather-info-span');
const defaultCountryOption = document.getElementById("default-country");
const defaultCityOption = document.getElementById("default-city");
const errorMssg = document.getElementById("error-mssg");

generateDefaultData();
aircraftsDropdown.addEventListener('change', () => {
  if(aircraftsDropdown.value == "Other") modelInp.classList.remove('hide');
  else modelInp.classList.add('hide');
})

countriesDropdown.addEventListener('change', () => {
  citiesDropdown.innerHTML = '<option value="Select a City">Select a City</option>';
  const selectedCountry = countriesDropdown.value
  if(selectedCountry == "select a country"){
      citiesDropdown.setAttribute('disabled', true)
      return;
  }
  defaultCountryOption.remove();

  fetch('https://raw.githubusercontent.com/russ666/all-countries-and-cities-json/master/countries.json')
    .then(response => response.json())
    .then(data => {
      const countriesData = Object(data);
      generateCities(countriesData[selectedCountry]);
    })
});

function generateCities(cities){
  cities.forEach(city => {  
    citiesDropdown.removeAttribute('disabled');
    var cityOption = document.createElement('option');
    cityOption.setAttribute('value', city);
    cityOption.innerText = city;
    citiesDropdown.append(cityOption);
  });
}

citiesDropdown.addEventListener('change', () => {

  const selectedCity = citiesDropdown.value
  if(selectedCity == "Select a City") return;

  defaultCityOption.remove();
  const cityURL = selectedCity.split(" ").join("%20");

  fetch(`https://api.tomorrow.io/v4/weather/history/recent?location=${cityURL}&timesteps=1d&units=metric&apikey=PY0w8ZwjhpgOyvnFd75Y5e8TDj83aJbV`)
  .then(response => response.json())
  .then(response => {

    var dataVals = response.timelines.daily[0].values
    var avgMean = dataVals.temperatureAvg;
    var maxMean = dataVals.temperatureMax;
    var ART = Math.ceil((avgMean + (maxMean - avgMean)/3) * 100000) /100000;

    tempAvgMean.value = avgMean;
    tempMaxMean.value = maxMean;
    ARTelm.value = ART;
    
    generateWeatherElms(dataVals);
  
  }).catch(err => console.error(err));
})

function generateWeatherElms(dataVals){
  for (const [idx, value] of Object.entries(dataVals)){
    var elm = document.createElement('p');
    elm.innerText = `${idx}: ${value}`;
    weatherInfoSpan.append(elm);
  }
}

moreInfoBtn.addEventListener('click', () => {
  moreInfoBtn.innerText = weatherInfoSpan.classList.contains('hide') == true ? "View less info" : "View more info"
  weatherInfoSpan.classList.toggle('hide')
})

tempAvgMean.addEventListener('input', changeART);
tempMaxMean.addEventListener('input', changeART);

function changeART(){
  var avgMean = parseInt(tempAvgMean.value);
  var maxMean = parseInt(tempMaxMean.value); 

  if(avgMean != NaN && maxMean != NaN){
    var ART = Math.ceil((avgMean + (maxMean - avgMean)/3) * 100000) /100000;
    ARTelm.value = ART;
  }
}

submitBtn.addEventListener('click', () => {

  if(aircraftsDropdown.value == "Select an Aircraft"){
    errorMssg.innerText = "Enter a valid aircraft.";
  }
  else if(aircraftsDropdown.value == "Other" && modelInp.value.trim() == ""){
    errorMssg.innerText = "Enter a valid aircraft.";
    modelInp.focus();
  }
  else if(parseInt(stdLength.value) <= 0 || parseInt(stdLength.value) == NaN){
    errorMssg.innerText = "Enter a positive runway length."
    stdLength.focus();
  }
  else if(parseInt(ARTelm.value) == NaN){
    errorMssg.innerText = "Invalid ART."
    ARTelm.focus();
  }
  else if(parseInt(elevation.value) == NaN){
    errorMssg.innerText = "Enter a valid elevation level."
    elevation.focus();
  }
  else if(parseInt(effGraddient.value) == NaN){
    errorMssg = "Enter a valid gradient."
    effGraddient.focus();
  }
  else{
    compute();
    if(citiesDropdown.value != "Select a City") moreInfoBtn.classList.remove('hide');
  }
})

function compute(){
    const altitudeCorrection = 0.07*(parseInt(elevation.value)/300)*stdLength.value;
    const gradientCorrection = 0.2*(parseInt(effGraddient.value)/100);
    const tempCorrection = ((parseInt(ARTelm.value) - 15)/100)*parseInt(stdLength.value)

    var totalLength = parseInt(stdLength.value) + altitudeCorrection + tempCorrection + gradientCorrection;
    totalLength = Math.round(totalLength * 1000) / 1000

    var model = aircraftsDropdown.value == "Other" ? modelInp.value : aircraftsDropdown.value
    correctedLength.innerHTML = `The corrected runway length for ${model} is <b>${totalLength} metres</b>.`
}

const resetBtn = document.getElementById("reset");
resetBtn.addEventListener('click', generateDefaultData);

function generateDefaultData(){

  stdLength.value = 0;
  tempMaxMean.value = 0;
  tempAvgMean.value = 0;
  ARTelm.value = 0;
  elevation.value = 0;
  effGraddient.value = 0;
  
  countriesDropdown.innerHTML = '<option id="default-country" value="select a country">Select a Country</option>'
  citiesDropdown.innerHTML =  '<option id="default-city" value="Select a City">Select a City</option>'
  aircraftsDropdown.innerHTML = '<option value="Select an Aircraft">Select an Aircraft</option>'
  moreInfoBtn.innerText = "View more info"
  correctedLength.innerHTML = ""
  modelInp.classList.toggle('hide', true);
  moreInfoBtn.classList.toggle('hide', true);
  weatherInfoSpan.classList.toggle('hide', true);

  fetch('https://raw.githubusercontent.com/russ666/all-countries-and-cities-json/master/countries.json')
  .then(response => response.json())
  .then(data => {
    Object.keys(data).forEach(country => {
      var countryOption = document.createElement('option');
      countryOption.setAttribute('value', country);
      countryOption.innerText = country;
      countriesDropdown.append(countryOption);
    });
  })

  const aircraftModels = ["Airbus A220","Airbus A300","Airbus A310","Airbus A318","Airbus A319","Airbus A320","Airbus A321",
  "Airbus A330","Airbus A340","Airbus A350","Airbus A380","Boeing 707","Boeing 717","Boeing 727","Boeing 737","Boeing 747",
  "Boeing 757","Boeing 767","Boeing 777","Boeing 787 Dreamliner","Boeing 797","Lockheed Martin C-130 Hercules",
  "Lockheed Martin F-35 Lightning II","Lockheed Martin P-3 Orion","Lockheed Martin SR-71 Blackbird","Bombardier CRJ Series",
  "Bombardier Dash 8 Q-Series","Embraer ERJ Series","Embraer E-Jet Series","Cessna 172 Skyhawk","Cessna 182 Skylane",
  "Cessna 208 Caravan","Cessna Citation series","Gulfstream G650","Gulfstream G550","Gulfstream G450","Gulfstream G280", "Other"];

  aircraftModels.forEach(aircraft => {
    var elm = document.createElement('option');
    elm.value = aircraft;
    elm.innerText = aircraft;
    aircraftsDropdown.append(elm);
  })
}