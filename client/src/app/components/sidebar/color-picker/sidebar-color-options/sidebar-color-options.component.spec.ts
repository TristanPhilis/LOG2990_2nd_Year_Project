import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarColorOptionsComponent } from './sidebar-color-options.component';

describe('SidebarColorOptionsComponent', () => {
  let component: SidebarColorOptionsComponent;
  let fixture: ComponentFixture<SidebarColorOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarColorOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarColorOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
