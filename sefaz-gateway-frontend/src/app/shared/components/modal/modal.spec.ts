import { TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal';

describe('ModalComponent', () => {
  function criar(fecharAoClicarFora = false) {
    const fixture = TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('titulo', 'Teste');
    fixture.componentRef.setInput('fecharAoClicarFora', fecharAoClicarFora);
    fixture.detectChanges();
    let fechou = 0;
    fixture.componentInstance.fechar.subscribe(() => fechou++);
    return { fixture, el: fixture.nativeElement as HTMLElement, fechou: () => fechou };
  }

  it('fecha pelo botão X', () => {
    const { el, fechou } = criar();
    (el.querySelector('.painel__fechar') as HTMLButtonElement).click();
    expect(fechou()).toBe(1);
  });

  it('fecha com Esc e não deixa o evento subir para o modal de baixo', () => {
    const { el, fechou } = criar();
    const evento = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    let chegouNoPai = false;
    el.parentElement!.addEventListener('keydown', () => (chegouNoPai = true));
    document.body.appendChild(el);

    (el.querySelector('.painel') as HTMLElement).dispatchEvent(evento);

    expect(fechou()).toBe(1);
    expect(chegouNoPai).toBe(false);
  });

  it('só fecha ao clicar fora quando isso é permitido', () => {
    const fechado = criar(false);
    (fechado.el.querySelector('.overlay') as HTMLElement).dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(fechado.fechou()).toBe(0);

    const permitido = criar(true);
    (permitido.el.querySelector('.overlay') as HTMLElement).dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(permitido.fechou()).toBe(1);
  });

  it('trava o scroll da página até o último modal empilhado fechar', () => {
    const primeiro = criar();
    expect(document.body.style.overflow).toBe('hidden');
    const segundo = criar();

    primeiro.fixture.destroy();
    expect(document.body.style.overflow).toBe('hidden');

    segundo.fixture.destroy();
    expect(document.body.style.overflow).toBe('');
  });
});
