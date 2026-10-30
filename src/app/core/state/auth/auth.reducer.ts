import { AuthState } from '../../../app.state';
import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import {
  authInitialized,
  login,
  loginFailure,
  loginSuccess,
  logout,
  restoreSession,
  restoreSessionFailure,
  restoreSessionSuccess,
} from './auth.actions';

const initialAuthState: AuthState = {
  user: null,
  token: null,
  initialized: false,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialAuthState,
  on(restoreSession, (state, { token }) => ({
    ...state,
    token,
    initialized: false,
    loading: true,
    error: null,
  })),
  on(authInitialized, (state) => ({ ...state, initialized: true, loading: false })),
  on(restoreSessionSuccess, (state, { user }) => ({
    ...state,
    user,
    initialized: true,
    loading: false,
    error: null,
  })),
  on(restoreSessionFailure, (_state, { error }) => ({
    ...initialAuthState,
    initialized: true,
    error,
  })),
  on(login, (state) => ({ ...state, loading: true, error: null })),
  on(loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    initialized: true,
    loading: false,
    error: null,
  })),
  on(loginFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(logout, () => ({ ...initialAuthState, initialized: true })),
);

export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectCurrentUser = createSelector(selectAuthState, (state) => state.user);
export const selectAuthToken = createSelector(selectAuthState, (state) => state.token);
export const selectAuthInitialized = createSelector(selectAuthState, (state) => state.initialized);
export const selectAuthLoading = createSelector(selectAuthState, (state) => state.loading);
export const selectAuthError = createSelector(selectAuthState, (state) => state.error);
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  ({ user, token, initialized }) => initialized && user !== null && token !== null,
);
export const selectIsAdmin = createSelector(selectCurrentUser, (user) => user?.role === 'ADMIN');
export const selectIsCustomer = createSelector(
  selectCurrentUser,
  (user) => user?.role === 'CUSTOMER',
);
