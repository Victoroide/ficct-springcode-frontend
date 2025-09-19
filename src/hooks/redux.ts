// @ts-nocheck - Ignorar errores de tipos

import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'

// Definiciones simplificadas para hooks
export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector
