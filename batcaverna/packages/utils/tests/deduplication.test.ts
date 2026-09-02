import { describe, it, expect } from 'vitest';
import { normalizarTextoParaHash } from '../src/index';

describe('Armazém de Questões — Normalização e Hash SHA-256', () => {
  it('Remove espaços extras e normaliza minúsculas', () => {
    const t1 = normalizarTextoParaHash('  Em  relação   à concordância ');
    const t2 = normalizarTextoParaHash('em relação à concordância');
    expect(t1).toBe(t2);
  });

  it('Remove acentos para imunidade a encoding', () => {
    const t1 = normalizarTextoParaHash('Matemática e Física');
    expect(t1).toBe('matematica e fisica');
  });

  it('Gera mesmo texto normalizado para variantes de pontuação/espaço', () => {
    const rawA = 'Qual é a capital do Brasil?   Brasília';
    const rawB = 'qual e a capital do brasil? brasilia';
    expect(normalizarTextoParaHash(rawA)).toBe(normalizarTextoParaHash(rawB));
  });
});
