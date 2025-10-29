import { Injectable } from '@angular/core';
import { Select } from 'primeng/select';

@Injectable({ providedIn: 'root' })
export class DropdownBackService {
  private selects = new Set<Select>();

  constructor() {
    window.addEventListener('popstate', () => {
      let closed = false;
      this.selects.forEach(s => {
        if (s.overlayVisible) {
          s.hide();      // close overlay
          closed = true;
        }
      });
      if (closed) {
        history.pushState(null, ''); // cancel the navigation
      }
    });
  }

  register(s: Select)   { this.selects.add(s); }
  unregister(s: Select) { this.selects.delete(s); }

  unregisterDialog(d: any){}
}
