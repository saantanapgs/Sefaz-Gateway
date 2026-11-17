import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renderiza a dashboard direto (sem router) e o host de confirmações/mensagens', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('app-gateway-dashboard')).toBeTruthy();
    expect(html.querySelector('app-overlays')).toBeTruthy();
    expect(html.querySelector('router-outlet')).toBeNull();
  });
});
