import { TypedUseSelectorHook, useDispatch as useRRDispatch, useSelector as useRRSelector } from 'react-redux'
import { RootState, AppDispatch } from './store'

export const useDispatch = () => useRRDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = useRRSelector