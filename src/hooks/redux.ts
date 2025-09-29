import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'

// Hook tipado para dispatch
export const useAppDispatch = () => useDispatch() as AppDispatch

// Hook tipado para selector
export const useAppSelector = <T>(selector: (state: RootState) => T): T => 
  useSelector(selector)
