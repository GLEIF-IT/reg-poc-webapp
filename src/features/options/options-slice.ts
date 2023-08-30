import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface OptionState {
  aidOption: string;
  acdcOption: string;
}
const initialState: OptionState = {
  aidOption: "",
  acdcOption: "",
};

const optionsSlice = createSlice({
  name: "options",
  initialState,
  reducers: {
    setAidOption(state, action: PayloadAction<string>) {
      state.aidOption = action.payload;
    },
    setAcdcOption(state, action: PayloadAction<string>) {
      state.acdcOption = action.payload;
    },
    resetAidOption(state) {
      state.aidOption = "";
    },
    resetAcdcOption(state) {
      state.acdcOption = "";
    },
  },
});

export default optionsSlice.reducer;
export const { setAidOption, resetAidOption, setAcdcOption, resetAcdcOption } =
  optionsSlice.actions;
