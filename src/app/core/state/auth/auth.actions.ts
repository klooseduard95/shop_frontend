import { createAction, props } from '@ngrx/store';
import { LoginRequest, UserProfile } from '../../../features/shared/types/users.types';

export const login = createAction('[Auth Page] Login', props<{ credentials: LoginRequest }>());
export const restoreSession = createAction('[Auth] Restore Session', props<{ token: string }>());
export const authInitialized = createAction('[Auth] Initialized Without Session');
export const restoreSessionSuccess = createAction(
  '[Auth API] Restore Session Success',
  props<{ user: UserProfile }>(),
);
export const restoreSessionFailure = createAction(
  '[Auth API] Restore Session Failure',
  props<{ error: string }>(),
);
export const loginSuccess = createAction(
  '[Auth API] Login Success',
  props<{ user: UserProfile; token: string }>(),
);
export const loginFailure = createAction('[Auth API] Login Failure', props<{ error: string }>());
export const logout = createAction('[Auth Page] Logout');
