import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiTools } from './ai-tools';

describe('AiTools', () => {
  let component: AiTools;
  let fixture: ComponentFixture<AiTools>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AiTools]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiTools);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
