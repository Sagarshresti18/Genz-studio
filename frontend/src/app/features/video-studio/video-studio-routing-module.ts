import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoStudio } from './video-studio';

const routes: Routes = [{ path: '', component: VideoStudio }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoStudioRoutingModule { }
