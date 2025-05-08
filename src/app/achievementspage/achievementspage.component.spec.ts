import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievementspageComponent } from './achievementspage.component';

describe('AchievementspageComponent', () => {
  let component: AchievementspageComponent;
  let fixture: ComponentFixture<AchievementspageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementspageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AchievementspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
