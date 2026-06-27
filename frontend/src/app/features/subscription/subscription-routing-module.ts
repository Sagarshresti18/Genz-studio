import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Subscription } from './subscription';

const routes: Routes = [{ path: '', component: Subscription }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule { }
