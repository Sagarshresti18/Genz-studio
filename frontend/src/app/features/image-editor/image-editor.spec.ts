import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageEditor } from './image-editor';

describe('ImageEditor', () => {
  let component: ImageEditor;
  let fixture: ComponentFixture<ImageEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImageEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
