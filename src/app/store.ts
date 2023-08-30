import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth-slice";
import optionsReducer from "../features/options/options-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    options: optionsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
