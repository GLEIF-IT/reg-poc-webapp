import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type Status = "Connect" | "Connecting" | "Connected" | "Failed";

interface AuthState {
  step: number;
  status: Status;
  modalOpen: boolean;
  modalError: string;
}
const initialState: AuthState = {
  step: 0,
  status: "Connect",
  modalOpen: false,
  modalError: "",
};

const authSlice = createSlice({
  name: "auth",
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

export default authSlice.reducer;
export const {
  incrementStep,
  setStep,
  setStatus,
  setModalOpen,
  setModalError,
} = authSlice.actions;
