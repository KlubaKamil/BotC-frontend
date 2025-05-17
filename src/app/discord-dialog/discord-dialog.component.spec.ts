import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordDialogComponent } from './discord-dialog.component';

describe('DiscordDialogComponent', () => {
  let component: DiscordDialogComponent;
  let fixture: ComponentFixture<DiscordDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscordDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
