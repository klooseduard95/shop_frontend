import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { UserProfile } from '../../shared/types/users.types';
import {
  authInitialized,
  login,
  loginFailure,
  loginSuccess,
  logout,
  restoreSession,
  restoreSessionFailure,
  restoreSessionSuccess,
  sessionClearedInAnotherTab,
} from './auth.actions';

export const authFeatureKey = 'auth';

export interface AuthState extends EntityState<UserProfile> {
  currentUserId: string | null;
  token: string | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

export const usersAdapter = createEntityAdapter<UserProfile>({
  selectId: (user) => user.id,
});

export const initialAuthState: AuthState = usersAdapter.getInitialState({
  currentUserId: null,
  token: null,
  initialized: false,
  loading: false,
  error: null,
});

export const authReducer = createReducer(
  initialAuthState,

  on(restoreSession, (state, { token }) => ({
    ...state,
    token,
    initialized: false,
    loading: true,
    error: null,
  })),

  on(authInitialized, (state) => ({
    ...state,
    initialized: true,
    loading: false,
  })),

  on(restoreSessionSuccess, (state, { user }) =>
    usersAdapter.setOne(user, {
      ...state,
      currentUserId: user.id,
      initialized: true,
      loading: false,
      error: null,
    }),
  ),

  on(restoreSessionFailure, (_state, { error }) => ({
    ...initialAuthState,
    initialized: true,
    error,
  })),

  on(login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(loginSuccess, (state, { user, token }) =>
    usersAdapter.setOne(user, {
      ...state,
      currentUserId: user.id,
      token,
      initialized: true,
      loading: false,
      error: null,
    }),
  ),

  on(loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(logout, sessionClearedInAnotherTab, () => ({
    ...initialAuthState,
    initialized: true,
  })),
);
