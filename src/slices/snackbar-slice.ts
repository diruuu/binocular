import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SnackbarKey, VariantType } from 'notistack';
import { RootState } from '../store';

interface ISnackbarItem {
  key?: SnackbarKey;
  message: string;
  variant?: VariantType;
}

interface ISnackbarState {
  messages: ISnackbarItem[];
}

const initialState: ISnackbarState = {
  messages: [],
};

export const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    appendSnackbar: (state, action: PayloadAction<ISnackbarItem>) => {
      action.payload.key = new Date().getTime() + Math.random();
      state.messages = [...state.messages, action.payload];
    },
    removeSnackbar: (state, action: PayloadAction<SnackbarKey>) => {
      state.messages = state.messages.filter(
        (message) => message.key !== action.payload
      );
    },
  },
});

export const { appendSnackbar, removeSnackbar } = snackbarSlice.actions;

export const selectSnackbars = (state: RootState): ISnackbarItem[] => {
  return state.snackbar.messages;
};

export default snackbarSlice.reducer;
