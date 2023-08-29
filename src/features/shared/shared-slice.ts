import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type Status =  "Connect" | "Connecting" | "Connected" | "Failed";

interface SharedState {
  value: number;
  status: Status;
}
const initialState: SharedState = {
  value: 0,
  status: "Connect",
}

const sharedSlice = createSlice({
  name: "shared",
  initialState,
  reducers: {
    incrementStep(state) {
      state.value++;
    },
    setStep(state, action: PayloadAction<number>) {
      state.value = action.payload;
    },
    setStatus(state, action: PayloadAction<Status>) {
      state.status = action.payload;
    }
  },
  
});

export default sharedSlice.reducer;
export const { incrementStep, setStep, setStatus } = sharedSlice.actions;
