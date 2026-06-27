import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AiToolsRoutingModule } from './ai-tools-routing-module';
import { AiTools } from './ai-tools';


@NgModule({
  declarations: [
    AiTools
  ],
  imports: [
    CommonModule,
    AiToolsRoutingModule
  ]
})
export class AiToolsModule { }
