import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImageEditor } from './image-editor';

const routes: Routes = [{ path: '', component: ImageEditor }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImageEditorRoutingModule { }
