import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type Status = "Connect" | "Connecting" | "Connected" | "Failed";

interface SharedState {
  step: number;
  status: Status;
  modalOpen: boolean;
  modalError: string;
}
const initialState: SharedState = {
  step: 0,
  status: "Connect",
  modalOpen: false,
  modalError: "",
};

const sharedSlice = createSlice({
  name: "shared",
  initialState,
  reducers: {
    incrementStep(state) {
      state.step++;
    },
    setStep(state, action: PayloadAction<number>) {
      state.step = action.payload;
    },
    setStatus(state, action: PayloadAction<Status>) {
      state.status = action.payload;
    },
    setModalOpen(state, action: PayloadAction<boolean>) {
      state.modalOpen = action.payload;
    },
    setModalError(state, action: PayloadAction<string>) {
      state.modalError = action.payload;
    },
  },
});

export default sharedSlice.reducer;
export const {
  incrementStep,
  setStep,
  setStatus,
  setModalOpen,
  setModalError,
} = sharedSlice.actions;
