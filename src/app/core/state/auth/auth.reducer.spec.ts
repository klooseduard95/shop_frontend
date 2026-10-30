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
import {
  authReducer,
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
});
