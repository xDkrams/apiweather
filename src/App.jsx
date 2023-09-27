import { useState, useEffect } from "react";
import "./index.css";
import axios from "axios";

//mui components
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";

import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

function App() {
  //api key
  const apiKey = "49f996a30961f249e6b14847600849f0";
  //states handling other components
  const [open, setOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [isErr, setIsErr] = useState(false);

  //handle other states
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [openSuggetions, setOpenSuggestion] = useState(false);
  const [weatherIcons, setweatherIcons] = useState([]);

  //states handling weather
  const [city, setCity] = useState("");
  const [weatherInfo, setWeatherInfo] = useState(null);

  const getWeatherSearch = () => {
    //search weather and create suggestion list of same city name
    axios
      .get(
        ` http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`
      )
      .then((res) => {
        // console.log(res);
        const data = res.data;
        const countries = data.map((country) => {
          return {
            country: country.country,
            lat: country.lat,
            lon: country.lon,
            name: country.name,
            state: country.state,
          };
        });

        setSuggestions(countries);
        setOpenSuggestion(true);
      })
      .catch((error) => {
        //error handling
        setAlertMsg(error.response.data.message);
        setOpen(true);
        setIsErr(true);
        setWeatherInfo(null);
        setOpenSuggestion(false);
      });
  };

  const handleSuggestionClick = (suggestion) => {
    //handle selected city to search for weather
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${suggestion.name}&appid=${apiKey}&units=metric`
      )
      .then((res) => {
        //round data
        let MT = Math.round(res.data.main.temp);
        let FL = Math.round(res.data.main.feels_like);

        //create object for displaying
        const weather = {
          location: `Weather in ${res.data.name}`,
          temperature: `Temperature: ${MT} C`,
          feelsLike: `Feels Like : ${FL} C`,
          humidiy: `Humidity: ${res.data.main.humidity}`,
          wind: `Wind : ${res.data.wind.speed} km/h`,
          condition: `Weather condition: ${res.data.weather[0].description}`,
        };

        const icons = res.data.weather[0];
        setweatherIcons(icons);
        setWeatherInfo(weather);
        setOpen(true);
        setAlertMsg("city found");
        setOpenSuggestion(false);
        setSuggestions([]);
      })
      .catch((error) => {
        //error handling
        setAlertMsg(error.response.data.message);
        setOpen(true);
        setIsErr(true);
        setWeatherInfo(null);
      });

    // set input value to empty after search
    setCity("");
    setSelectedSuggestion(null);
  };
  useEffect(() => {
    if (open) {
      // If the 'open' state is true, set a timeout to close it after 5 seconds
      const timeoutId = setTimeout(() => {
        setOpen(false);
        setAlertMsg(null);
        setIsErr(false);
      }, 5000);

      // Clean up the timeout when the component unmounts or when 'open' changes
      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  return (
    <Box className="h-screen">
      <Box className="h-1/6">
        <Collapse in={open}>
          <Alert
            severity={isErr ? "error" : "success"}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setOpen(false);
                  setAlertMsg(null);
                  setIsErr(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {alertMsg}
          </Alert>
        </Collapse>
      </Box>
      <Box className=" md:flex-row justify-center items-center mt-32">
        <Box className="flex justify-center items-center mx-2 md:mx-0 md:pl-4">
          <TextField
            label="Search City"
            variant="outlined"
            className="w-full md:w-64 lg:w-96"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onClick={() => {
              setOpen(false);
              setAlertMsg(null);
              setIsErr(false);
              setOpenSuggestion(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                getWeatherSearch();
              }
            }}
          />
          <Box className="mt-2 md:mt-0 md:ml-4">
            <Button
              className={
                city
                  ? "bg-indigo-200 mr-64 border-2 text-gray-950 rounded-lg"
                  : "mr-64 border-2 text-gray-300 rounded-lg"
              }
              onClick={getWeatherSearch}
              disabled={city ? false : true}
            >
              {" "}
              search weather{" "}
            </Button>
          </Box>
        </Box>
        <Box className="flex justify-center pr-48 ml-8 ">
          {openSuggetions && (
            <List component="nav" className="w-6/12 md:w-96 lg:w-96 ">
              {suggestions.map((suggestion, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleSuggestionClick(suggestion)}
                  selected={selectedSuggestion === suggestion}
                >
                  <ListItemText
                    primary={`${suggestion.name}, ${
                      suggestion.state !== undefined
                        ? `${suggestion.state}, `
                        : ""
                    }${suggestion.country}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
        {!openSuggetions && (
          <Box>
            <Box className="flex justify-center items-center">
              {weatherInfo && (
                <img
                  src={`https://openweathermap.org/img/wn/${weatherIcons?.icon}@2x.png`}
                  alt={`${weatherIcons.description}`}
                  className="pr-72 flex items-center space-x-2 animate-move-left-to-right"
                />
              )}
            </Box>
            <Box className="flex justify-center pt-16 pb-8">
              <Box>
                {" "}
                <p className="font-extrabold text-xl px-4">
                  {weatherInfo?.location}
                </p>
              </Box>

              <Box className=" px-8 mb-16 ">
                <p>{weatherInfo?.temperature}</p>
              </Box>
              <Box className=" px-8 mb-16 ">
                <p>{weatherInfo?.feelsLike}</p>
              </Box>
              <Box className=" px-8 mb-16 ">
                <p>{weatherInfo?.humidiy}</p>
              </Box>
              <Box className=" px-8 mb-16 ">
                <p>{weatherInfo?.wind}</p>
              </Box>
              <Box className=" px-8 mb-16 ">
                <p>{weatherInfo?.condition}</p>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;
