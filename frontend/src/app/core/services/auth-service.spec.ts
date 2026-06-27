import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth-service';

describe('AuthService', () => {
  it('should login and logout using signals', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthService);

    service.login('test@genz.studio', 'Admin');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.user()?.role).toBe('Admin');

    service.logout();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
