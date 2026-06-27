import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoStudio } from './video-studio';

describe('VideoStudio', () => {
  let component: VideoStudio;
  let fixture: ComponentFixture<VideoStudio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VideoStudio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoStudio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
