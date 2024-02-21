const topPanel = document.getElementById("topPanel");
const bottomPanel = document.getElementById("bottomPanel");
const roomStatus = document.getElementById("roomStatus");
const workspaceName = document.getElementById("workspaceName");
const peopleCount = document.getElementById("peopleCount");
const roomTemp = document.getElementById("roomTemp");
const ambientNoise = document.getElementById("roomSound");
const outsideTemp = document.getElementById("outsideTemp");
const outsideCondititions = document.getElementById("outsideCondititions");
const cityName = document.getElementById("cityName");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const apiKey = urlParams.get("apiKey") || "<Open Weather API Key>";
const cityId = urlParams.get("cityId") || "2759794"

let xapi;
let meetingRoomName = "Testing";
let userName = "";
let capacity = 10;
let roomNavigator = null;
let occupied = false;
let booked = false;
let peopleCountCurrent = 0;
let hotdesking = false;
let metricOnly = false;

if (urlParams.get("metricOnly")) {
  console.log('Displaying Metric Only')
  metricOnly = true;
}

window.onload = async function () {
  console.log("initizing");
  init();
  updateWeather();
  setInterval(updateWeather, 10 * 1000 * 60);
};

async function init() {
  try {
    xapi = await window.getXAPI();
    console.log("Connected to Webex Device");
    xapi.Config.UserInterface.LedControl.Mode.set("Manual")
      .then((result) => console.log("Led Control set to manual", result))
      .catch((error) => console.log("Unable to set LedControl to manual"));
    console.log("testing");
    getInitial();
    subscribe();
  } catch (e) {
    console.log("Unable to connect to Webex Device:", e);
  }
}

async function getInitial() {
  console.log("Getting Initial Values");
  checkHotdeskState();
  pollStatus();
  setInterval(pollStatus, 1 * 1000 * 60);

  xapi.Status.RoomAnalytics.PeopleCount.Capacity.get().then((roomCapacity) => {
    console.log("RoomCount Capacity:", roomCapacity);
    if (roomCapacity == "-1") roomCapacity = 1;
    capacity = roomCapacity;
  });

  xapi.Status.RoomAnalytics.PeopleCount.Current.get().then((currentCount) => {
    console.log("RoomCount Current:", currentCount);
    if (currentCount == "-1") currentCount = 0;
    peopleCount.innerHTML = `${currentCount}/${capacity}`;
    peopleCountCurrent = currentCount;
  });

  xapi.Status.Bookings.Availability.Status.get().then((bookedStatus) => {
    console.log("Booked Status:", bookedStatus);
    booked = bookedStatus != "Free";
  });
  updateRoomStatus();
}

async function updateRoomStatus() {
  console.log("Updating Room Status");
  if (peopleCountCurrent > 0) {
    displayOccupied();
    return;
  }

  if (hotdesking) {
    displayReserved();
    return;
  }

  if (booked) {
    displayBooked();
    return;
  }

  displayAvailable();
}

function subscribe() {
  console.log("Subscribing to status changes");

  xapi.Status.Bookings.Availability.Status.on((status) =>
    console.log("Booking Status Changed to:", status)
  );

  xapi.Status.UserInterface.ContactInfo.Name.on((value) => checkHotdeskState());

  xapi.Status.Bookings.Availability.TimeStamp.on((status) =>
    console.log("Booking TimeStamp Changed to:", status)
  );

  xapi.Status.RoomAnalytics.PeopleCount.Capacity.on((roomCapacity) => {
    console.log("RoomCount Capacity changed to:", roomCapacity);
    if (roomCapacity == "-1") roomCapacity = 1;
    capacity = roomCapacity;
    updateRoomStatus();
  });

  xapi.Status.RoomAnalytics.PeopleCount.Current.on((currentCount) => {
    console.log("RoomCount Current changed to:", currentCount);
    if (currentCount == "-1") currentCount = 0;
    peopleCount.innerHTML = `${currentCount}/${capacity}`;
    peopleCountCurrent = currentCount;
    updateRoomStatus();
  });
}

async function checkHotdeskState() {
  const status = await xapi.Status.get();
  if (status.hasOwnProperty("Webex")) {
    if (status.Webex.DevicePersonalization.Accounts.length == 2) {
      console.log("Device is in Hostdesking mode and reserved by ");
      console.log(status.Webex.DevicePersonalization.Accounts);
      hotdesking = true;
      userName = status.Webex.DevicePersonalization.Accounts[1].DisplayName;
      workspaceName.innerHTML =
        status.Webex.DevicePersonalization.Accounts[0].DisplayName;
      console.log("Device is in Hostdesking mode and reserved by " + userName);
      updateRoomStatus();
      return;
    }

    console.log("Device is in Hostdesking mode and isn't reserved");

    hotdesking = false;
    workspaceName.innerHTML =
      status.Webex.DevicePersonalization.Accounts[0].DisplayName;
    updateRoomStatus();
    return;
  } else {
    console.log("Device has switched to Hostdesking");
    hotdesking = false;
    workspaceName.innerHTML = status.Webex.Accounts[0].DisplayName;
  }

  updateRoomStatus();
}

function displayOccupied() {
  console.log("Setting status to Occupied");
  topPanel.style.backgroundColor = "red";
  bottomPanel.style.backgroundColor = "red";
  roomStatus.innerHTML = "Occupied";
  bottomPanel.style.color = "white";

  //Green, Yellow, Red, Off
  xapi.Command.UserInterface.LedControl.Color.Set({ Color: "Red" });
}

function displayBooked() {
  console.log("Setting status to Booked");
  topPanel.style.backgroundColor = "orange";
  bottomPanel.style.backgroundColor = "orange";
  bottomPanel.style.color = "white";
  roomStatus.innerHTML = "Booked";
  xapi.Command.UserInterface.LedControl.Color.Set({ Color: "Yellow" });
}

function displayReserved() {
  console.log("Setting status to Reserved by" + userName);
  topPanel.style.backgroundColor = "orange";
  bottomPanel.style.backgroundColor = "orange";
  bottomPanel.style.color = "white";
  roomStatus.innerHTML = `Reserved by ${userName}`;
  xapi.Command.UserInterface.LedControl.Color.Set({ Color: "Yellow" });
}

function displayAvailable() {
  console.log("Setting status to Available");
  topPanel.style.backgroundColor = "green";
  bottomPanel.style.backgroundColor = "green";
  bottomPanel.style.color = "white";
  roomStatus.innerHTML = "Available";
  xapi.Command.UserInterface.LedControl.Color.Set({ Color: "Green" });
}

function updateTemperature(ambientTemp) {
  console.log("Ambient Temp:", ambientTemp);

  if (metricOnly) {
    roomTemp.innerHTML = `${Math.round(ambientTemp)}°C`;
  } else {
    roomTemp.innerHTML = `${Math.round(
      (9 / 5) * ambientTemp + 32
    )}°F | ${Math.round(ambientTemp)}°C`;
  }
}

function pollStatus() {
  console.log("Polling Status");
  // xapi.Status.RoomAnalytics.AmbientTemperature.get()
  //   .then((ambientTemp) => updateTemperature(ambientTemp))
  //   .catch((error) => console.log("Unable to Ambient Temperature"));
  
  getTemperature();

  xapi.Status.RoomAnalytics.AmbientNoise.Level.A.get()
    .then((noise) => {
      console.log("Ambient Noise:", noise);
      ambientNoise.innerHTML = `${noise} dBA`;
    })
    .catch((error) => console.log("Unable to get Ambient Noise"));
}

function convertTemp(celc) {
  const far = (celc * 9.0) / 5.0 + 32.0;
  return Math.round(far) + "°F " + celc + "°C";
}

async function getTemperature() {
  const navID = await inRoomNavigator(xapi);
  console.log("NavID", navID);

  if (navID != -1) {
    console.log(
      `Getting Temperature and Humidity values from In-Room Navigator [${navID}]`
    );
    const ambientTemp =  
      await xapi.Status.Peripherals.ConnectedDevice[
        navID
      ].RoomAnalytics.AmbientTemperature.get();
    
    updateTemperature(ambientTemp)
   
  } else {
    console.log(
      `No In-Room Navigators found, attempting to get data from main device`
    );
    try {
      const ambientTemp =  await xapi.Status.RoomAnalytics.AmbientTemperature.get();
      updateTemperature(ambientTemp)
    } catch {
      console.log(`Temperature sensor not available on main device`);
    }
  }
}

function inRoomNavigator(xapi) {
  return xapi.Status.Peripherals.ConnectedDevice.get()
    .then((devices) => {
      const navigators = devices.filter((d) => {
        return (
          d.Name.endsWith("Navigator") &&
          d.Type == "TouchPanel" &&
          d.Location == "InsideRoom"
        );
      });

      if (navigators.length == 0) {
        return -1;
      } else {
        return navigators.pop().id;
      }
    })
    .catch((e) => {
      return -1;
    });
}

function getWeather() {
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  return fetch(
    `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${apiKey}`,
    requestOptions
  )
    .then((response) => response.text())
    .then((response) => JSON.parse(response))
    .catch((error) => console.log("error", error));
}

async function updateWeather() {
  console.log("Updating Weather");
  const result = await getWeather();
  console.log(result);
  if (!result) return;
  console.log("temp kelvin", result.main.temp);
  const fTemp = Math.round((result.main.temp - 273.15) * 1.8 + 32);
  const cTemp = Math.round(result.main.temp - 273.15);

  if (metricOnly) {
    outsideTemp.innerHTML = `${cTemp}°C`;
  } else {
    outsideTemp.innerHTML = `${fTemp}°F | ${cTemp}°C`;
  }
  cityName.innerHTML = result.name;
  outsideCondititions.innerHTML = result.weather[0].description.replace(
    /(^\w{1})|(\s+\w{1})/g,
    (letter) => letter.toUpperCase()
  );
}
