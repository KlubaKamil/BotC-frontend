import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptspageComponent } from './scriptspage.component';

describe('ScriptspageComponent', () => {
  let component: ScriptspageComponent;
  let fixture: ComponentFixture<ScriptspageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScriptspageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScriptspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
