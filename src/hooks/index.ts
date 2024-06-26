import { TypedUseSelectorHook, useSelector } from 'react-redux'
import type { RootState } from '../saga/store'

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
