import { Directive, OnInit, OnDestroy } from '@angular/core';
import { Select } from 'primeng/select';
import { DropdownBackService } from '../dropdown-back-service/dropdown-back.service';

@Directive({
  selector: 'p-select[pCloseOnBack]',
  standalone: true
})
export class SelectBackCloseDirective implements OnInit, OnDestroy {
  constructor(private select: Select, private backSvc: DropdownBackService) {}

  ngOnInit(){
    this.backSvc.register(this.select);
  }
  
  ngOnDestroy(){ 
    this.backSvc.unregister(this.select); 
  }
}