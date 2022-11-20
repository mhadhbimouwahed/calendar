import React, {
  useState,
  useEffect,
  useReducer,
  useMemo,
} from "react";
import GlobalContext from "./GlobalContext";
import dayjs from "dayjs";
import axios from "axios";

function savedEventsReducer(state, { type, payload }) {
  switch (type) {
    case "push": {
      const { title, description, activity_type, activity, label, day, id } = payload
      const event = new Date(day)
      console.log("recieved from backend", event)
      console.log(event.toLocaleDateString("en-US"))

      /*       const timestamp = event.getFullYear() + '-' + event.getMonth() + '-' + event.getDay() */
      // console.log(timestamp)
      // const data = {
      //   title: title,
      //   description: description,
      //   activity_type: activity_type,
      //   activity: activity,
      //   labe: label,
      //   day: timestamp
      // }
      // console.log(data)
      // axios.post("http://localhost:8000/sheet/", data)
      //   .then((resp) => console.log(resp.data))
      //   .catch((err) => console.log(err))
      /* return [...state, payload]; */
    }
    case "update":
      return state.map((evt) =>
        evt.id === payload.id ? payload : evt
      );
    case "delete":
      return state.filter((evt) => evt.id !== payload.id);
    default:
      throw new Error();
  }
}

function initEvents() {
  const storageEvents = localStorage.getItem("savedEvents");
  const parsedEvents = storageEvents ? JSON.parse(storageEvents) : [];
  return parsedEvents;
}

export default function ContextWrapper(props) {
  const [monthIndex, setMonthIndex] = useState(dayjs().month());
  const [smallCalendarMonth, setSmallCalendarMonth] = useState(null);
  const [daySelected, setDaySelected] = useState(dayjs());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [labels, setLabels] = useState([]);

  const [timesheets, setTimesheets] = useState([])
  const [savedEvents, dispatchCalEvent] = useReducer(
    savedEventsReducer,
    [],
    initEvents
  );

  const filteredEvents = useMemo(() => {
    return savedEvents.filter((evt) =>
      labels
        .filter((lbl) => lbl.checked)
        .map((lbl) => lbl.label)
        .includes(evt.label)
    );
  }, [savedEvents, labels]);

  useEffect(() => {
    localStorage.setItem("savedEvents", JSON.stringify(savedEvents));
  }, [savedEvents]);

  useEffect(() => {
    setLabels((prevLabels) => {
      return [...new Set(savedEvents.map((evt) => evt.label))].map(
        (label) => {
          const currentLabel = prevLabels.find(
            (lbl) => lbl.label === label
          );
          return {
            label,
            checked: currentLabel ? currentLabel.checked : true,
          };
        }
      );
    });
  }, [savedEvents]);

  useEffect(() => {
    if (smallCalendarMonth !== null) {
      setMonthIndex(smallCalendarMonth);
    }
  }, [smallCalendarMonth]);

  useEffect(() => {
    if (!showEventModal) {
      setSelectedEvent(null);
    }
  }, [showEventModal]);

  function updateLabel(label) {
    setLabels(
      labels.map((lbl) => (lbl.label === label.label ? label : lbl))
    );
  }

  useEffect(() => {
    const getTimeSheets = async () => {
      const resp = await axios("http://localhost:8000/sheet/")
      const data = resp.data
      setTimesheets(data)
    }
    getTimeSheets()
  }, [])

  return (
    <GlobalContext.Provider
      value={{
        monthIndex,
        setMonthIndex,
        smallCalendarMonth,
        setSmallCalendarMonth,
        daySelected,
        setDaySelected,
        showEventModal,
        setShowEventModal,
        dispatchCalEvent,
        selectedEvent,
        setSelectedEvent,
        savedEvents,
        setLabels,
        labels,
        updateLabel,
        filteredEvents,
        timesheets,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}
