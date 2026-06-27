import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageEditorRoutingModule } from './image-editor-routing-module';
import { ImageEditor } from './image-editor';


@NgModule({
  declarations: [
    ImageEditor
  ],
  imports: [
    CommonModule,
    ImageEditorRoutingModule
  ]
})
export class ImageEditorModule { }
