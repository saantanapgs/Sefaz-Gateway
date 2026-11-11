import { TestBed } from '@angular/core/testing';
import { ToggleSwitchComponent } from './toggle-switch';

describe('ToggleSwitchComponent', () => {
  function criar(ativo: boolean, desabilitado = false) {
    const fixture = TestBed.createComponent(ToggleSwitchComponent);
    fixture.componentRef.setInput('ativo', ativo);
    fixture.componentRef.setInput('rotulo', 'Desativar Gateway X');
    fixture.componentRef.setInput('desabilitado', desabilitado);
    fixture.detectChanges();
    return fixture;
  }

  it('reflete o estado em aria-checked', () => {
    const botao = criar(true).nativeElement.querySelector('button') as HTMLButtonElement;
    expect(botao.getAttribute('role')).toBe('switch');
    expect(botao.getAttribute('aria-checked')).toBe('true');
  });

  it('avisa o clique, mas não muda de estado sozinho', () => {
    const fixture = criar(true);
    let emitido = 0;
    fixture.componentInstance.alternar.subscribe(() => emitido++);

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(emitido).toBe(1);
    expect((fixture.nativeElement.querySelector('button') as HTMLButtonElement).getAttribute('aria-checked')).toBe('true');
  });

  it('não emite quando está desabilitado', () => {
    const fixture = criar(false, true);
    let emitido = 0;
    fixture.componentInstance.alternar.subscribe(() => emitido++);

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(emitido).toBe(0);
  });
});
