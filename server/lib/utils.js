const axios = require('axios');
const config = require("config");
const {State} = require("../models/states");
const {City} = require("../models/cities");
const {Zip} = require("../models/zips");

const abbrs = config.get("states.abbreviation.all");

const getAbbreviation = ac => {

  const abbrData = ac.filter(x => abbrs.indexOf(x.short_name) !== -1);
  if (!abbrData || !abbrData.length || abbrData[0].short_name === undefined) return null;

  return abbrData[0].short_name;
};


const retrieveCity = ac => {
  const cityData = ac.filter(x => x.types[0] === 'locality');
  if (!cityData || !cityData.length || cityData[0].long_name === undefined) return null;
  return cityData[0].long_name;
};


exports.getZip = async zip => {
  const res = await axios.get(`${config.get("geo")}address=${zip}&key=${config.get("apiKey")}`);

  if (res.data.status === 'OK' && res.data.results[0] !== undefined) {

    const result = res.data.results[0];
    const ac = result.address_components;
    console.log(result);

    // Make sure that place in US
    const US = ac.map(x => x.short_name === "US" ? x : null).filter(x => x);
    if (!US && !US.length) return null;

    // Make sure that abbreviation in exist
    const abbreviation = getAbbreviation(ac);
    if (!abbreviation) return null;

    // Try to retrieve state from the database
    const state = await State.getByAbbreviation(abbreviation);
    if (!state) return null;

    // Retrieve city name from the response
    const cityName = retrieveCity(ac);
    if (!cityName) return null;

    // Try to find city
    let city = await City.getByName(cityName, state._id);

    if (!city) {

      // If city not in database create a new one
      city = await City.create({name: cityName, state: state._id});
      state.cities.push(city._id);
      await state.save();
    }

    // Create a zip code
    await Zip({
      _id: zip,
      city: city._id,
      state: state._id,
      loc: result.geometry.location
    }).save();

    // console.log(loc, state, city);
    return Zip.getByZip(zip);
  } else return null;
};



