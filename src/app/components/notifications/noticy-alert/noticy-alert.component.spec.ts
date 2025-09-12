import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticyAlertComponent } from './noticy-alert.component';

describe('NoticyAlertComponent', () => {
  let component: NoticyAlertComponent;
  let fixture: ComponentFixture<NoticyAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticyAlertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoticyAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
