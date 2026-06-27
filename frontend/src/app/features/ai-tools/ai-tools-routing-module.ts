import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AiTools } from './ai-tools';

const routes: Routes = [{ path: '', component: AiTools }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AiToolsRoutingModule { }
