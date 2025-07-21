import { useState, useEffect } from "react";

const quotes = [
  "Discipline is the bridge between goals and accomplishment",
  "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort",
  "The key to success is to focus our conscious mind on things we desire, not things we fear",
  "Discipline is choosing between what you want now and what you want most",
  "It’s not about having time, it’s about making time",
  "The Pomodoro Technique is simple: work with time, not against it",
  "Don’t count the days, make the days count",
  "Success is nothing more than a few simple disciplines, practiced every day",
  "Discipline weighs ounces, regret weighs tons",
  "When you feel like quitting, remember why you started",
  "Start where you are. Use what you have. Do what you can",
  "Small daily improvements over time lead to stunning results",
  "Your level of success is determined by your level of discipline and perseverance",
  "Focus on progress, not perfection",
  "The future depends on what you do today",
  "Motivation gets you going, but discipline keeps you growing",
  "Discipline is the foundation upon which all success is built",
  "Work smarter, not harder — the essence of productivity",
  "Use the Pomodoro Technique to break down work into focused intervals and watch your productivity soar",
  "Don’t let perfect be the enemy of good. Start now, improve as you go"
];


function QuoteBanner() {
  const [quote, setQuote] = useState("Discipline is the bridge between goals and accomplishment");

  useEffect(() => {
    const pickRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[randomIndex]);
    };

    pickRandomQuote(); 

    const intervalId = setInterval(pickRandomQuote, 9000); 

    return () => clearInterval(intervalId); 
  }, []);

  return (
    <div className="quote-banner" aria-live="polite">
      {quote}
    </div>
  );
}

export default QuoteBanner;