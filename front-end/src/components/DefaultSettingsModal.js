import { useState, useEffect } from "react";
import { useGetUserSettingsQuery, useUpdateUserSettingsMutation } from "../RTK/slices/userSettingApi";

function DefaultSettingsModal({onCancel}) {
  const { data: userDefaultSetting } = useGetUserSettingsQuery();
  const [updateUserSettings] = useUpdateUserSettingsMutation();
  const [defaultSession, setDefaultSession] = useState({});


  useEffect(() => {
    if (userDefaultSetting?.data?.userSettings) {
      setDefaultSession(userDefaultSetting.data.userSettings);
    }
  }, [userDefaultSetting]);

  const [focusTime, setFocusTime] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [roundsBeforeLongBreak, setRoundsBeforeLongBreak] = useState(3);
  
  useEffect(() => {
    if (defaultSession) {
      setFocusTime(defaultSession.focusTime || 25);
      setShortBreak(defaultSession.shortBreak || 5);
      setLongBreak(defaultSession.longBreak || 15);
      setRoundsBeforeLongBreak(defaultSession.roundsBeforeLongBreak || 3);
    }
  }, [defaultSession]);

  const sendData = async ()=>{
    const formData = {
      focusTime,
      shortBreak,
      longBreak,
      roundsBeforeLongBreak
    }

    try{      
      const response = await updateUserSettings(formData).unwrap()
      if(response) onCancel();
    }catch(error){
      const message = error?.data?.message;
      document.querySelector(".general.warning-message").textContent = message;
    }

  };

  const fieldsValidation = () =>{
    const errors = [];
    if (focusTime < 1) errors.push("Focus Time");
    if (shortBreak < 1) errors.push("Short Break");
    if (longBreak < 1) errors.push("Long Break");
    if (roundsBeforeLongBreak < 1) errors.push("Rounds Before Long Break");

    if (errors.length) {
      document.querySelector(".general.warning-message").textContent = 
        `${errors.join(", ")} must be at least 1`;
      return false;
    }
    return true;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    fieldsValidation() && sendData();
    
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <header className="modal-header-pomodoro">
          <h2>Default Settings</h2>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          <p className='general warning-message'></p>
          <label>
            Focus Time (minutes)
            <input
              type="number"
              value={focusTime}
              onChange={(e) => setFocusTime(Number(e.target.value))}
              required
            />
          </label>

          <label>
            Short Break (minutes)
            <input
              type="number"
              value={shortBreak}
              onChange={(e) => setShortBreak(Number(e.target.value))}
              required
            />
          </label>

          <label>
            Long Break (minutes)
            <input
              type="number"
              value={longBreak}
              onChange={(e) => setLongBreak(Number(e.target.value))}
              required
            />
          </label>

          <label>
              Long Break interval
            <input
              type="number"
              value={roundsBeforeLongBreak}
              onChange={(e) => setRoundsBeforeLongBreak(Number(e.target.value))}
              required
            />
          </label>

          <div className="form-actions">
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit" >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DefaultSettingsModal;
