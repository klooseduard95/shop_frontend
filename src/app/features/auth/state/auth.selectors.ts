import { createFeatureSelector, createSelector } from '@ngrx/store';
import { authFeatureKey, AuthState, usersAdapter } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>(authFeatureKey);

const userEntitySelectors = usersAdapter.getSelectors();

export const selectUserIds = createSelector(selectAuthState, userEntitySelectors.selectIds);

export const selectUserEntities = createSelector(
  selectAuthState,
  userEntitySelectors.selectEntities,
);

export const selectAllUsers = createSelector(selectAuthState, userEntitySelectors.selectAll);

export const selectCurrentUserId = createSelector(selectAuthState, (state) => state.currentUserId);

export const selectCurrentUser = createSelector(
  selectUserEntities,
  selectCurrentUserId,
  (entities, currentUserId) => (currentUserId === null ? null : (entities[currentUserId] ?? null)),
);

export const selectAuthToken = createSelector(selectAuthState, (state) => state.token);

export const selectAuthInitialized = createSelector(selectAuthState, (state) => state.initialized);

export const selectAuthGuardData = createSelector(
  selectAuthInitialized,
  selectCurrentUser,
  (initialized, user) => ({ initialized, user }),
);

export const selectAuthLoading = createSelector(selectAuthState, (state) => state.loading);

export const selectAuthError = createSelector(selectAuthState, (state) => state.error);

export const selectIsAuthenticated = createSelector(
  selectCurrentUser,
  selectAuthToken,
  selectAuthInitialized,
  (user, token, initialized) => initialized && user !== null && token !== null,
);

export const selectIsAdmin = createSelector(selectCurrentUser, (user) => user?.role === 'ADMIN');

export const selectIsCustomer = createSelector(
  selectCurrentUser,
  (user) => user?.role === 'CUSTOMER',
);
