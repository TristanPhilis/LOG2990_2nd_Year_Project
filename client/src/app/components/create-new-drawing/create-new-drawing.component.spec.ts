import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewDrawingComponent } from './create-new-drawing.component';

describe('CreateNewDrawingComponent', () => {
  let component: CreateNewDrawingComponent;
  let fixture: ComponentFixture<CreateNewDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
