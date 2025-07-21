import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './RTK/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import '../src/styles/main.css';
import '../src/styles/navbar.css';
import '../src/styles/sidebar.css';
import '../src/styles/homePage.css';
import '../src/styles/toDoListPage.css';
import '../src/styles/loginPage.css';
import '../src/styles/registerPage.css';
import '../src/styles/verifyEmailPage.css';
import '../src/styles/tasks.css';
import '../src/styles/habitTrackerPage.css';
import '../src/styles/allHabitsComponent.css';
import '../src/styles/pomodoroPage.css';
import '../src/styles/footer.css';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
