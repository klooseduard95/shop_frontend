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
import {
  authReducer,
  AuthState,
  selectAuthError,
  selectAuthInitialized,
  selectAuthLoading,
  selectAuthToken,
  selectCurrentUser,
  selectIsAdmin,
  selectIsAuthenticated,
  selectIsCustomer,
} from './auth.reducer';

describe('authReducer', () => {
  const user = { id: '1', username: 'user', role: 'CUSTOMER' as const };

  it('should initialize without a persisted session', () => {
    const state = authReducer(undefined, authInitialized());

    expect(state).toEqual({
      user: null,
      token: null,
      initialized: true,
      loading: false,
      error: null,
    });
  });

  it('should restore a persisted session', () => {
    const restoring = authReducer(undefined, restoreSession({ token: 'token' }));
    const restored = authReducer(restoring, restoreSessionSuccess({ user }));

    expect(restoring).toMatchObject({ token: 'token', initialized: false, loading: true });
    expect(restored).toMatchObject({
      user,
      token: 'token',
      initialized: true,
      loading: false,
      error: null,
    });
  });

  it('should clear stale auth data when restoration fails', () => {
    const restoring = authReducer(undefined, restoreSession({ token: 'expired' }));
    const failed = authReducer(restoring, restoreSessionFailure({ error: 'Unauthorized' }));

    expect(failed).toEqual({
      user: null,
      token: null,
      initialized: true,
      loading: false,
      error: 'Unauthorized',
    });
  });

  it('should handle login success, failure, and logout', () => {
    const loading = authReducer(undefined, login({ credentials: { username: 'user' } }));
    const failed = authReducer(loading, loginFailure({ error: 'Invalid credentials' }));
    const loggedIn = authReducer(failed, loginSuccess({ user, token: 'token' }));
    const loggedOut = authReducer(loggedIn, logout());

    expect(loading.loading).toBe(true);
    expect(failed).toMatchObject({ loading: false, error: 'Invalid credentials' });
    expect(loggedIn).toMatchObject({ user, token: 'token', error: null });
    expect(loggedOut).toEqual({
      user: null,
      token: null,
      initialized: true,
      loading: false,
      error: null,
    });
  });

  it('should derive authentication and role flags', () => {
    expect(
      selectIsAuthenticated.projector({
        user,
        token: 'token',
        initialized: true,
        loading: false,
        error: null,
      }),
    ).toBe(true);
    expect(
      selectIsAuthenticated.projector({
        user: null,
        token: 'token',
        initialized: false,
        loading: true,
        error: null,
      }),
    ).toBe(false);
    expect(selectIsAdmin.projector({ ...user, role: 'ADMIN' })).toBe(true);
    expect(selectIsCustomer.projector(user)).toBe(true);
  });

  it('should clear auth state when another tab clears the session', () => {
    const loggedIn = authReducer(
      undefined,
      loginSuccess({
        user,
        token: 'token',
      }),
    );

    const cleared = authReducer(
      loggedIn,
      sessionClearedInAnotherTab({
        returnUrl: '/products',
      }),
    );

    expect(cleared).toEqual({
      user: null,
      token: null,
      initialized: true,
      loading: false,
      error: null,
    });
  });

  it('should return the initial state for an unknown action', () => {
    expect(authReducer(undefined, { type: 'Unknown action' })).toEqual({
      user: null,
      token: null,
      initialized: false,
      loading: false,
      error: null,
    });
  });

  it('should project every auth state property', () => {
    const state: AuthState = {
      user,
      token: 'token',
      initialized: true,
      loading: true,
      error: 'Auth error',
    };

    expect(selectCurrentUser.projector(state)).toEqual(user);
    expect(selectAuthToken.projector(state)).toBe('token');
    expect(selectAuthInitialized.projector(state)).toBe(true);
    expect(selectAuthLoading.projector(state)).toBe(true);
    expect(selectAuthError.projector(state)).toBe('Auth error');
  });

  it('should return false for missing and different roles', () => {
    expect(selectIsAdmin.projector(null)).toBe(false);
    expect(selectIsAdmin.projector(user)).toBe(false);
    expect(selectIsCustomer.projector(null)).toBe(false);
    expect(
      selectIsCustomer.projector({
        ...user,
        role: 'ADMIN',
      }),
    ).toBe(false);
  });
});
