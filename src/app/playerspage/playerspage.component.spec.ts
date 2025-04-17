import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerspageComponent } from './playerspage.component';

describe('PlayerspageComponent', () => {
  let component: PlayerspageComponent;
  let fixture: ComponentFixture<PlayerspageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerspageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
