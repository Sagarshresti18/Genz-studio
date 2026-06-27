import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoStudioRoutingModule } from './video-studio-routing-module';
import { VideoStudio } from './video-studio';


@NgModule({
  declarations: [
    VideoStudio
  ],
  imports: [
    CommonModule,
    VideoStudioRoutingModule
  ]
})
export class VideoStudioModule { }
