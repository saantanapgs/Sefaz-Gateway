import { TestBed } from '@angular/core/testing';
import { ActionsMenuComponent, ItemMenu } from './actions-menu';

describe('ActionsMenuComponent', () => {
  const itens: ItemMenu[] = [
    { id: 'editar', rotulo: 'Editar' },
    { id: 'excluir', rotulo: 'Excluir', perigo: true },
  ];

  function criar() {
    const fixture = TestBed.createComponent(ActionsMenuComponent);
    fixture.componentRef.setInput('itens', itens);
    fixture.detectChanges();
    return fixture;
  }

  it('começa fechado e abre ao clicar nos três pontos', () => {
    const fixture = criar();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="menu"]')).toBeNull();

    (el.querySelector('.gatilho') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(el.querySelectorAll('[role="menuitem"]').length).toBe(2);
  });

  it('emite o id do item escolhido e fecha o menu', () => {
    const fixture = criar();
    const el = fixture.nativeElement as HTMLElement;
    const escolhidos: string[] = [];
    fixture.componentInstance.selecionar.subscribe((id) => escolhidos.push(id));

    (el.querySelector('.gatilho') as HTMLButtonElement).click();
    fixture.detectChanges();
    (el.querySelectorAll('[role="menuitem"]')[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(escolhidos).toEqual(['excluir']);
    expect(el.querySelector('[role="menu"]')).toBeNull();
  });
});
