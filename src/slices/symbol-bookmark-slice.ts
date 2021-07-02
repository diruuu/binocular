import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import localForage from 'localforage';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';

interface ISymbolBookmarkState {
  bookmarkList: string[];
}

const initialState: ISymbolBookmarkState = {
  bookmarkList: [],
};

export const symbolBookmarkSlice = createSlice({
  name: 'symbolBookmark',
  initialState,
  reducers: {
    toggleBookmarkSymbol: (state, action: PayloadAction<string>) => {
      const bookmarked = state.bookmarkList.includes(action.payload);
      if (bookmarked) {
        state.bookmarkList = state.bookmarkList.filter(
          (symbol) => symbol !== action.payload
        );
      } else {
        state.bookmarkList = [...state.bookmarkList, action.payload];
      }
    },
  },
});

export const { toggleBookmarkSymbol } = symbolBookmarkSlice.actions;

export const selectBookmarkList = (state: RootState): string[] => {
  return state.symbolBookmark.bookmarkList;
};

const persistConfig = {
  key: 'symbolBookmark',
  storage: localForage,
  whitelist: ['bookmarkList'],
};

const persistedReducer = persistReducer(
  persistConfig,
  symbolBookmarkSlice.reducer
);

export default persistedReducer;
