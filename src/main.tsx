import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { store } from "./app/store";
import { Provider } from "react-redux";
import { AutonomicIDContextProvider } from "./contexts/AutonomicID.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <AutonomicIDContextProvider>
        <App />
      </AutonomicIDContextProvider>
    </Provider>
  </React.StrictMode>
);
