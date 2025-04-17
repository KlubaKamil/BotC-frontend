import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterspageComponent } from './characterspage.component';

describe('CharacterspageComponent', () => {
  let component: CharacterspageComponent;
  let fixture: ComponentFixture<CharacterspageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterspageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
