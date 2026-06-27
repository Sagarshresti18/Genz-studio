import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme-service';

describe('ThemeService', () => {
  it('should toggle dark and light modes', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);

    expect(service.mode()).toBe('light');
    service.toggleTheme();
    expect(service.mode()).toBe('dark');
  });
});
