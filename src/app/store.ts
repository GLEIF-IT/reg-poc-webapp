import { configureStore } from "@reduxjs/toolkit";
import sharedReducer from "../features/shared/shared-slice";
import optionsReducer from "../features/options/options-slice";

export const store = configureStore({
  reducer: {
    shared: sharedReducer,
    options: optionsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
