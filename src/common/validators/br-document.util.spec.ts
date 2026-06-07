import {
  isValidCPF,
  isValidCNPJ,
  isValidCpfOrCnpj,
  isValidCEP,
  onlyDigits,
} from './br-document.util';

describe('br-document.util', () => {
  describe('CPF', () => {
    it('accepts valid CPFs (formatted and raw)', () => {
      expect(isValidCPF('111.444.777-35')).toBe(true);
      expect(isValidCPF('39053344705')).toBe(true);
    });
    it('rejects invalid CPFs', () => {
      expect(isValidCPF('111.444.777-00')).toBe(false);
      expect(isValidCPF('00000000000')).toBe(false);
      expect(isValidCPF('123')).toBe(false);
    });
  });

  describe('CNPJ', () => {
    it('accepts valid CNPJs', () => {
      expect(isValidCNPJ('19.131.243/0001-97')).toBe(true);
    });
    it('rejects invalid CNPJs', () => {
      expect(isValidCNPJ('11.111.111/1111-11')).toBe(false);
      expect(isValidCNPJ('123')).toBe(false);
    });
  });

  describe('isValidCpfOrCnpj', () => {
    it('routes by length', () => {
      expect(isValidCpfOrCnpj('39053344705')).toBe(true);
      expect(isValidCpfOrCnpj('19131243000197')).toBe(true);
      expect(isValidCpfOrCnpj('999')).toBe(false);
    });
  });

  it('validates CEP length', () => {
    expect(isValidCEP('95010-000')).toBe(true);
    expect(isValidCEP('123')).toBe(false);
  });

  it('strips non-digits', () => {
    expect(onlyDigits('111.444.777-35')).toBe('11144477735');
  });
});
