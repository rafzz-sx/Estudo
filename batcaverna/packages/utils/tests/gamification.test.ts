import { describe, it, expect } from 'vitest';
import {
  calcularNivel,
  calcularMultiplicadorContinuidade,
  calcularBonusCombo,
  formatarTempoEstudo,
  formatarDataHoraVersao,
} from '../src/index';

describe('Gamificação — 15 Níveis e XP da BatCaverna', () => {
  it('Nível 1 (Recruta das Sombras) para 0 XP', () => {
    const res = calcularNivel(0);
    expect(res.nivel).toBe(1);
    expect(res.titulo).toBe('Recruta das Sombras');
    expect(res.xp_atual_no_nivel).toBe(0);
  });

  it('Nível 2 (Aprendiz da Caverna) para 150 XP', () => {
    const res = calcularNivel(150);
    expect(res.nivel).toBe(2);
    expect(res.titulo).toBe('Aprendiz da Caverna');
  });

  it('Nível 15 (Rei da Batcaverna) para 23000 XP', () => {
    const res = calcularNivel(23000);
    expect(res.nivel).toBe(15);
    expect(res.titulo).toBe('Rei da Batcaverna');
  });

  it('Multiplicador de continuidade: +10% a cada 15min até max 50%', () => {
    expect(calcularMultiplicadorContinuidade(0)).toBe(1.0);
    expect(calcularMultiplicadorContinuidade(1)).toBe(1.1);
    expect(calcularMultiplicadorContinuidade(3)).toBe(1.3);
    expect(calcularMultiplicadorContinuidade(5)).toBe(1.5);
    expect(calcularMultiplicadorContinuidade(10)).toBe(1.5); // capped at 1.5
  });

  it('Bônus de combo de acertos', () => {
    expect(calcularBonusCombo(1)).toBe(1.0);
    expect(calcularBonusCombo(3)).toBe(1.0);
    expect(calcularBonusCombo(4)).toBe(1.05);
    expect(calcularBonusCombo(10)).toBe(1.35);
    expect(calcularBonusCombo(20)).toBe(1.5); // capped at 1.5
  });

  it('Formatação de data de versão somente com hora cheia', () => {
    const formatada = formatarDataHoraVersao('2026-08-27T14:35:00Z');
    expect(formatada).toContain('às');
    expect(formatada).toMatch(/\d{2}\/\d{2}\/\d{4} às \d+h/);
  });
});
