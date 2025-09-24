import { useState, useEffect, useRef, useCallback } from "react";
import QuoteBanner from "../components/QuoteBanner";
import { useGetUserSettingsQuery } from "../RTK/slices/userSettingApi";
import DefaultSettingsModal from "../components/DefaultSettingsModal";
import AddPomodoroSessionModel from "../components/AddPomodoroSessionModal";
import { useCreatePomodoroMutation, useGetpomodorosQuery, useUpdatePomodoroMutation } from "../RTK/slices/pomodoroApi";
import { Link } from "react-router";

const sessionTypes = [
  { key: "focusTime", label: "Focus", colorClass: "focus" },
  { key: "shortBreak", label: "Short Break", colorClass: "short_break" },
  { key: "longBreak", label: "Long Break", colorClass: "long_break" },
];

// Default settings for guests (non-logged-in users)
const GUEST_DEFAULT_SETTINGS = {
  focusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  roundsBeforeLongBreak: 4,
};

function PomodoroPage() {
  const isLoggedIn = localStorage.getItem("token")?.trim();

  // جلب إعدادات المستخدم الافتراضية (only for logged-in users)
  const { data: userDefaultSetting, isLoading } = useGetUserSettingsQuery(undefined, {
    skip: !isLoggedIn,
  });

  // الحالة الافتراضية للجلسات
  const [defaultSessions, setDefaultSessions] = useState(GUEST_DEFAULT_SETTINGS);

  useEffect(() => {
    if (isLoggedIn && userDefaultSetting?.data?.userSettings) {
      setDefaultSessions(userDefaultSetting.data.userSettings);
    } else if (!isLoggedIn) {
      setDefaultSessions(GUEST_DEFAULT_SETTINGS);
    }
  }, [userDefaultSetting, isLoggedIn]);

  // جلب كل الجلسات (only for logged-in users)
  const { data: pomodoroSessions } = useGetpomodorosQuery(undefined, {
    skip: !isLoggedIn,
  });

  const [allSessions, setAllSessions] = useState([]);

  useEffect(() => {
    if (isLoggedIn && pomodoroSessions?.data?.allPomodoroSessions) {
      setAllSessions(pomodoroSessions.data.allPomodoroSessions);
    } else if (!isLoggedIn) {
      setAllSessions([]);
    }
  }, [pomodoroSessions, isLoggedIn]);

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

  // For guest users, keep track of sessions in memory
  const [guestSessionCount, setGuestSessionCount] = useState(1);

  // مراجع المؤقت والصوت
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const endTimeRef = useRef(null);
  const pauseTimeRef = useRef(null);

  // تحديث اسم الجلسة تلقائيًا إذا لم يكن مخصصًا
  useEffect(() => {
    if (!isCustomName) {
      const sessionCount = isLoggedIn ? allSessions.length + 1 : guestSessionCount;
      setSessionName(`Session ${sessionCount - 1}`);
    }
  }, [allSessions.length, guestSessionCount, isCustomName, isLoggedIn]);

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
      audioRef.current.play().catch(() => setWarningMessage("Sound could not be played!"));
    }
  }, []);

  // إنهاء الجلسة (only for logged-in users)
  const [updatePomodoroSession] = useUpdatePomodoroMutation();
  const handleCompletSession = useCallback(async () => {
    if (isLoggedIn && currentSessionId) {
      try {
        await updatePomodoroSession({
          pomodoroId: currentSessionId,
          formData: {
            status: "completed",
            endedAt: new Date(),
          },
        });
      } catch (error) {
        setWarningMessage(error?.data?.message || "Failed to update session");
      }
    }
  }, [currentSessionId, updatePomodoroSession, isLoggedIn]);

  const handleEndSession = useCallback(() => {
    clearInterval(timerRef.current);
    endTimeRef.current = null;
    pauseTimeRef.current = null;

    setIsRunning(false);
    setTimeLeft(sessionTime);
    setIsPause(false);

    // Update session count for guests
    if (!isLoggedIn) {
      setGuestSessionCount(prev => prev + 1);
    }

    const nextSessionCount = isLoggedIn ? allSessions.length + 1 : guestSessionCount + 1;
    setSessionName(`Session ${nextSessionCount}`);
    setWarningMessage("");

    if (isLoggedIn) {
      handleCompletSession();
    }
  }, [sessionTime, allSessions.length, guestSessionCount, handleCompletSession, isLoggedIn]);

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
    }, 1000);

    if (isLoggedIn) {
      handleCompletSession();
    }
  }, [playAlarm, sendNotification, handleEndSession, sessionType, defaultSessions, handleCompletSession, isLoggedIn]);

  // إدارة المؤقت
  useEffect(() => {
    if (isRunning && !isPause && timeLeft > 0) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      timerRef.current = setInterval(() => {
        const secondsLeft = Math.max(
          Math.floor((endTimeRef.current - Date.now()) / 1000),
          0
        );
        setTimeLeft(secondsLeft);

        if (secondsLeft <= 0) {
          clearInterval(timerRef.current);
          endTimeRef.current = null;
          handleTimeUp();
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [isRunning, isPause, handleTimeUp]);

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
  const createSessionInDB = async (formData) => {
    try {
      const response = await createNewPomodoroSession(formData).unwrap();
      if (response?.data?.newPomodoreSession?._id) {
        setCurrentSessionId(response.data.newPomodoreSession._id);
      }
    } catch (error) {
      setWarningMessage(error?.data?.message || "Something went wrong while saving the session");
    }
  };

  const handleStartSession = async () => {
    setIsRunning(true);
    setIsPause(false);
    requestNotificationPermission();

    if (isLoggedIn) {
      const sessionTimeMinutes = sessionTime / 60;
      const formData = {
        sessionName,
        sessionType,
        duration: sessionTimeMinutes,
        status: "inProgress",
      };
      await createSessionInDB(formData);
    } else {
      setWarningMessage("Running in guest mode - sessions won't be saved. Sign in to track your progress!");
      setTimeout(() => setWarningMessage(""), 3000);
    }
  };

  // إضافة جلسة جديدة مخصصة
  const handleNewSession = async (newSession) => {
    setIsCustomName(true);
    setSessionType(newSession.sessionType);
    setSessionName(newSession.sessionName);
    const durationSeconds = newSession.duration * 60;
    setSessionTime(durationSeconds);
    setTimeLeft(durationSeconds);
    setIsRunning(true);
    setIsPause(false);

    if (isLoggedIn) {
      const formData = {
        sessionName: newSession.sessionName,
        sessionType: newSession.sessionType,
        duration: newSession.duration,
        status: "inProgress",
      };
      await createSessionInDB(formData);
    }
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

  // Loading state only for logged-in users
  if (isLoggedIn && isLoading) {
    return (
      <div className="tasks-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

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
              <p className="page-subtitle">
                {isLoggedIn
                  ? "Organize and track your daily tasks efficiently"
                  : "Try our Pomodoro Timer - Sign in to save your progress!"}
              </p>
            </div>
          </div>
          {!isLoggedIn && (
            <div className="guest-mode-banner">
              <p className="guest-notice">
                <i className="bi bi-info-circle"></i>
                You're using guest mode. Your sessions won't be saved.
                <Link to={"/login"} className="login-link"> Login here</Link>
              </p>
            </div>
          )}
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
            {isLoggedIn && (
              <button className="setting-btn btn" onClick={() => setShowModal(true)}>
                <i className="bi bi-gear"></i>
              </button>
            )}
          </div>
          <div className="pomodoro-timer" role="timer" aria-live="assertive" aria-atomic="true">
            {warningMessage && (
              <p className={`general warning-message ${!isLoggedIn && warningMessage.includes('guest mode') ? 'guest-info' : ''}`}>
                {warningMessage}
              </p>
            )}
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
                <p className="task-name">
                  {sessionName.length > 25 ? `${sessionName.substring(0, 25)}...` : sessionName}
                </p>
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
                    onClick={() => {
                      if (!isPause) {
                        pauseTimeRef.current = timeLeft;
                        clearInterval(timerRef.current);
                        setIsPause(true);
                      } else {
                        const newEndTime = Date.now() + pauseTimeRef.current * 1000;
                        endTimeRef.current = newEndTime;
                        setTimeLeft(pauseTimeRef.current);
                        setIsPause(false);
                      }
                    }}
                  >
                    {isPause ? "Continue" : "Pause"}
                  </button>
                  <button
                    onClick={() => {
                      setTimeLeft(sessionTime);
                      setIsPause(false);
                      endTimeRef.current = Date.now() + sessionTime * 1000;
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
          {/* Show AddPomodoroSessionModel for both logged-in and guest users */}
          {isLoggedIn && (
            <AddPomodoroSessionModel
              onSessionAdd={handleNewSession}
              isRunning={isRunning}
              sessionType={sessionType}
              sessionTime={sessionTime}
              isGuest={!isLoggedIn}
            />
          )}
        </div>
        {isLoggedIn && showModal && (
          <DefaultSettingsModal
            onCancel={() => setShowModal(false)}
            sessionType={sessionType}
            duration={sessionTime}
            isGuest={!isLoggedIn}
          />
        )}
      </div>
    </>
  );
};

export default PomodoroPage;