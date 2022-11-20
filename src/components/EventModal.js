import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";
import Select from "react-select"
import axios from 'axios';

const labelsClasses = [
  "indigo",
  "gray",
  "green",
  "blue",
  "red",
  "purple",
];

export default function EventModal() {
  const {
    setShowEventModal,
    daySelected,
    dispatchCalEvent,
    selectedEvent,
  } = useContext(GlobalContext);


  const [title, setTitle] = useState(
    selectedEvent ? selectedEvent.title : ""
  );
  const [description, setDescription] = useState(
    selectedEvent ? selectedEvent.description : ""
  );
  const [selectedLabel, setSelectedLabel] = useState(
    selectedEvent
      ? labelsClasses.find((lbl) => lbl === selectedEvent.label)
      : labelsClasses[0]
  );
  const [activity, setActivity] = useState(
    selectedEvent ? selectedEvent.activity : ""
  )

  const [activity_type, setActivityType] = useState(
    selectedEvent ? selectedEvent.activity_type : ""
  )

  const [activityTypes, setActivityTypes] = useState([])
  const [activities, setActivities] = useState([])
  const [id, setId] = useState("1")

  const handleActivityTypeChange = (e) => {
    setActivityType(e.value)
    setId(e.value)
  }

  const handleActivityChange = (e) => {
    setActivity(e.value)
  }

  useEffect(() => {
    const getActivityTypes = async () => {
      const resp = await axios("http://localhost:8000/activity-type/")
      const data = await resp.data
      setActivityTypes(data)
    }
    getActivityTypes()
  }, [])

  useEffect(() => {
    const getActivities = async () => {
      const resp = await axios(`http://localhost:8000/activity/activity-type/${id}/`)
      const data = await resp.data
      setActivities(data)
    }
    getActivities()
  }, [id])



  function handleSubmit(e) {
    e.preventDefault();
    const calendarEvent = {
      title,
      description,
      activity_type,
      activity,
      label: selectedLabel,
      day: JSON.parse(daySelected.valueOf()),
      id: selectedEvent ? selectedEvent.id : Date.now(),
    };
    console.log('sent from front', new Date(calendarEvent.day))
    if (selectedEvent) {
      dispatchCalEvent({ type: "update", payload: calendarEvent });
    } else {
      dispatchCalEvent({ type: "push", payload: calendarEvent });
    }
    setShowEventModal(false);
  }
  return (
    <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center">
      <form className="bg-white rounded-lg shadow-2xl w-1/4">
        <header className="bg-gray-100 px-4 py-2 flex justify-between items-center">
          <DragIndicatorOutlinedIcon />
          <div>
            {selectedEvent && (
              <span
                onClick={() => {
                  dispatchCalEvent({
                    type: "delete",
                    payload: selectedEvent,
                  });
                  setShowEventModal(false);
                }}
                className="material-icons-outlined text-gray-400 cursor-pointer"
              >
                <DeleteOutlineIcon />
              </span>
            )}
            <button onClick={() => setShowEventModal(false)}>
              <CloseOutlinedIcon />
            </button>
          </div>
        </header>
        <div className="p-3">
          <div className="grid grid-cols-1/5 items-end gap-y-7">
            <div></div>
            <input
              type="text"
              name="title"
              placeholder="Add Title"
              value={title}
              required
              className="pt-3 border-0 text-gray-600 text-xl font-semibold pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setTitle(e.target.value)}
            />
            <span className="material-icons-outlined text-gray-400">
            </span>
            <p>{daySelected.format("dddd, MMMM DD")}</p>
            <span className="material-icons-outlined text-gray-400">
            </span>

            <Select options={activityTypes.map((actp) => {
              const { id, activity_type } = actp
              return { value: id, label: activity_type }
            })} onChange={handleActivityTypeChange} placeholder="select an activity type" />
            <span className="material-icons-outlined text-gray-400"></span>
            <Select options={activities.map((act) => {
              const { id, activity } = act
              return { value: id, label: activity }
            })} onChange={handleActivityChange} placeholder="select an activity" />
            <span className="material-icons-outlined text-gray-400">
            </span>
            <input
              type="text"
              name="description"
              placeholder="Add a description"
              value={description}
              required
              className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setDescription(e.target.value)}
            />
            <span className="material-icons-outlined text-gray-400">
            </span>
            <div className="flex gap-x-2">
              {labelsClasses.map((lblClass, i) => (
                <span
                  key={i}
                  onClick={() => setSelectedLabel(lblClass)}
                  className={`bg-${lblClass}-500 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer`}
                >
                  {selectedLabel === lblClass && (
                    <CheckCircleOutlineOutlinedIcon />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
        <footer className="flex justify-end border-t p-3 mt-5">
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded text-white"
          >
            Save
          </button>
        </footer>
      </form>
    </div>
  );
}
