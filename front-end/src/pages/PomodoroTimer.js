import { useState, useEffect, useRef, useCallback } from "react";
import QuoteBanner from "../components/QuoteBanner";
import { useGetUserSettingsQuery } from "../RTK/slices/userSettingApi";
import DefaultSettingsModal from "../components/DefaultSettingsModal";
import AddPomodoroSessionModel from "../components/AddPomodoroSessionModal";
import { useCreatePomodoroMutation, useGetpomodorosQuery, useUpdatePomodoroMutation } from "../RTK/slices/pomodoroApi";

const sessionTypes = [
  { key: "focusTime", label: "Focus", colorClass: "focus" },
  { key: "shortBreak", label: "Short Break", colorClass: "short_break" },
  { key: "longBreak", label: "Long Break", colorClass: "long_break" },
];

function PomodoroPage() {
  // جلب إعدادات المستخدم الافتراضية
  const { data: userDefaultSetting, isLoading } = useGetUserSettingsQuery();

  // الحالة الافتراضية للجلسات
  const [defaultSessions, setDefaultSessions] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    roundsBeforeLongBreak: 4,
  });

  useEffect(() => {
    if (userDefaultSetting?.data?.userSettings) {
      setDefaultSessions(userDefaultSetting.data.userSettings);
    }
  }, [userDefaultSetting]);

  // جلب كل الجلسات
  const { data: pomodoroSessions } = useGetpomodorosQuery();
  const [allSessions, setAllSessions] = useState([]);
  useEffect(() => {
    if (pomodoroSessions?.data?.allPomodoroSessions) {
      setAllSessions(pomodoroSessions.data.allPomodoroSessions);
    }
  }, [pomodoroSessions]);

  // إدارة الحالة للجلسة الحالية
  const [sessionKey, setSessionKey] = useState("focusTime");
  const [sessionType, setSessionType] = useState("focus");
  const [sessionLabel, setSessionLabel] = useState("Focus");
  const [sessionName, setSessionName] = useState("");
  const [isCustomName, setIsCustomName] = useState(false);
  const [sessionTime, setSessionTime] = useState(defaultSessions.focusTime * 60);
  const [timeLeft, setTimeLeft] = useState(sessionTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // مراجع المؤقت والصوت
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // تحديث اسم الجلسة تلقائيًا إذا لم يكن مخصصًا
  useEffect(() => {
    if (!isCustomName) {
      setSessionName(`Session ${allSessions.length + 1}`);
    }
  }, [allSessions.length, isCustomName]);

  // تحديث وقت الجلسة عند تغيير الإعدادات أو نوع الجلسة
  useEffect(() => {
    setSessionTime(defaultSessions[sessionKey] * 60);
  }, [defaultSessions, sessionKey]);

  // إعادة ضبط الوقت عند تغيير sessionTime أو sessionKey
  useEffect(() => {
    setTimeLeft(sessionTime);
    setIsRunning(false);
    setIsPause(false);
  }, [sessionTime, sessionKey]);

  // تحديث عنوان الصفحة
  useEffect(() => {
    document.title = isRunning ? formatTime(timeLeft) : "BoostMe";
  }, [isRunning, timeLeft]);

  // طلب إذن الإشعارات مرة واحدة فقط بعد أول تفاعل
  const [notificationAsked, setNotificationAsked] = useState(false);
  const requestNotificationPermission = useCallback(() => {
    if (!notificationAsked && "Notification" in window) {
      Notification.requestPermission();
      setNotificationAsked(true);
    }
  }, [notificationAsked]);

  // إرسال إشعار
  const sendNotification = useCallback((title, options) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    }
  }, []);

  // تشغيل صوت التنبيه
  const playAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => setWarningMessage("sound not will be play!"));
    }
  }, []);

  // إنهاء الجلسة
  const [updatePomodoroSession] = useUpdatePomodoroMutation();
  const handleCompletSession = useCallback(async () => {
    if (currentSessionId) {
      try {
        await updatePomodoroSession({
          pomodoroId: currentSessionId,
          formData: {
            status: "completed",
            endedAt: new Date(),
          },
        });
      } catch (error) {
        setWarningMessage(error?.data?.message);
      }
    }
  }, [currentSessionId, updatePomodoroSession]);

  const handleEndSession = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(sessionTime);
    setIsPause(false);
    setSessionName(`Session ${allSessions.length + 1}`);
    setWarningMessage("");
    handleCompletSession();
  }, [sessionTime, allSessions.length, handleCompletSession]);

  // عند انتهاء الوقت
  const handleTimeUp = useCallback(() => {
    playAlarm();
    sendNotification("⏰ Time's up!", {
      body: "Your Pomodoro session has ended.",
    });

    setTimeout(() => {
      handleEndSession();
      if (sessionType === "focus") {
        setSessionType("short_break");
        setSessionKey("shortBreak");
        setSessionLabel("Short Break");
        setSessionTime(defaultSessions.shortBreak * 60);
        setTimeLeft(defaultSessions.shortBreak * 60);
      } else {
        setSessionType("focus");
        setSessionKey("focusTime");
        setSessionLabel("Focus");
        setSessionTime(defaultSessions.focusTime * 60);
        setTimeLeft(defaultSessions.focusTime * 60);
      }
      setIsRunning(false);
    }, 2000);
  }, [playAlarm, sendNotification, handleEndSession, sessionType, defaultSessions]);

  // إدارة المؤقت
  useEffect(() => {
    if (isRunning && !isPause && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimeUp();
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isPause, timeLeft, handleTimeUp]);

  // تعطيل أزرار الجلسات أثناء التشغيل
  useEffect(() => {
    sessionTypes.forEach((btn) => {
      const button = document.querySelector(`.${btn.key}`);
      if (button) {
        button.disabled = isRunning && btn.key !== sessionKey;
      }
    });
  }, [isRunning, sessionKey]);

  // بدء الجلسة
  const [createNewPomodoroSession] = useCreatePomodoroMutation();
  const handleStartSession = async () => {
    setIsRunning(true);
    setIsPause(false);
    requestNotificationPermission();

    // إرسال بيانات الجلسة الجديدة
    const sessionTimeMinutes = sessionTime / 60;
    const formData = {
      sessionName,
      sessionType,
      duration: sessionTimeMinutes,
      status: "inProgress",
    };
    try {
      const response = await createNewPomodoroSession(formData).unwrap();
      if (response?.data?.newPomodoreSession?._id) {
        setCurrentSessionId(response.data.newPomodoreSession._id);
      }
    } catch (error) {
      setWarningMessage(error?.data?.message || "somthing error");
    }
  };

  // إضافة جلسة جديدة مخصصة
  const handleNewSession = (newSession) => {
    setIsCustomName(true);
    setSessionType(newSession.sessionType);
    setSessionName(newSession.sessionName);
    const durationSeconds = newSession.duration * 60;
    setSessionTime(durationSeconds);
    setTimeLeft(durationSeconds);
    setIsRunning(true);
    setIsPause(false);
  };

  // تنسيق الوقت
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // حساب التقدم
  const progress = timeLeft / sessionTime;
  const customProgress = ((sessionTime - timeLeft) / sessionTime) * 100;
  const dashOffset = (2 * Math.PI * 57 * (customProgress / 100));

  return (
    <>
      <div className="container pomodoro-page">
        <div className="page-header">
          <div className="header-content">
            <div className="page-icon" style={{ backgroundColor: "var(--accent)" }}>
              <i className="bi bi-stopwatch"></i>
            </div>
            <div className="header-text">
              <h1 className="page-title">Pomodoro Timer</h1>
              <p className="page-subtitle">Organize and track your daily tasks efficiently</p>
            </div>
          </div>
        </div>
        <QuoteBanner />
        <div className="pomodoro-container">
          <div className="session-buttons">
            {sessionTypes.map(({ key, label, colorClass }) => (
              <button
                key={key}
                onClick={() => {
                  setSessionKey(key);
                  setSessionType(colorClass);
                  setSessionLabel(label);
                  setSessionTime(defaultSessions[key] * 60);
                  setTimeLeft(defaultSessions[key] * 60);
                  setIsRunning(false);
                  setIsPause(false);
                  setIsCustomName(false);
                }}
                className={`${colorClass} ${key} ${sessionKey === key ? "selected" : ""}`}
                type="button"
                disabled={isRunning && key !== sessionKey}
              >
                {label}
              </button>
            ))}
            <button className="setting-btn btn" onClick={() => setShowModal(true)}>
              <i className="bi bi-gear "></i>
            </button>
          </div>

          {isLoading || !userDefaultSetting?.data?.userSettings ? (
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <>
            <div className="pomodoro-timer" role="timer" aria-live="assertive" aria-atomic="true">
              {warningMessage && <p className="general warning-message">{warningMessage}</p>}
              <audio src="/assets/alarm-327234.mp3" ref={audioRef} preload="auto" />
              <div className={`timer-circle ${sessionKey}`} aria-label={`Time left: ${formatTime(timeLeft)}`}>
                {customProgress >= 0 && (
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="-3 -3 120 120"
                    style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
                  >
                    <circle
                      cx="57"
                      cy="57"
                      r="56.99"
                      stroke="var(--bg-tertiary)"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      className="progress-circle-2"
                      cx="57"
                      cy="57"
                      r="56.99"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 57}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.3s ease" }}
                    />
                  </svg>
                )}
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    zIndex: 1,
                  }}
                >
                  <p className="session-type">{sessionLabel}</p>
                  <p className="timer-text">{formatTime(timeLeft)}</p>
                  <p className="task-name">{sessionName.length > 25 ? `${sessionName.substring(0, 25)}...`: sessionName}</p>
                </div>
              </div>

              {isRunning && (
                <div className={`progress-tape ${sessionType}`}>
                  <div
                    className="progress-color"
                    style={{
                      width: `${100 - progress * 100}%`,
                      transition: "width 0.5s linear",
                    }}
                  />
                  <span className="progress-label">{`${(100 - progress * 100).toFixed()}%`}</span>
                </div>
              )}

              <div className="timer-controls">
                {isRunning ? (
                  <>
                    <button
                      className={`${sessionKey} pause`}
                      type="button"
                      onClick={() => setIsPause((prev) => !prev)}
                    >
                      {isPause ? "Continue" : "Pause"}
                    </button>
                    <button
                      onClick={() => {
                        setTimeLeft(sessionTime);
                        setIsPause(false);
                      }}
                      type="button"
                      className="reset"
                    >
                      Reset
                    </button>
                    <button className={`${sessionKey} stop`} type="button" onClick={handleEndSession}>
                      Stop
                    </button>
                  </>
                ) : (
                  <button className={`${sessionKey} start`} onClick={handleStartSession} type="button">
                    Start
                  </button>
                )}
              </div>
            </div>
             <AddPomodoroSessionModel
            onSessionAdd={handleNewSession}
            isRunning={isRunning}
            sessionType={sessionType}
            sessionTime={sessionTime}
          />
          </>
          )}

         
        </div>

        {showModal && (
          <DefaultSettingsModal
            onCancel={() => setShowModal(false)}
            sessionType={sessionType}
            duration={sessionTime}
          />
        )}
      </div>
    </>
  );
}

export default PomodoroPage;