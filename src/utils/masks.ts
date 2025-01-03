export const cepMask = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/(\d{5})(\d)/, '$1-$2') // Coloca hífen entre o 5º e o 6º dígitos
    .substring(0, 9); // Limita em 9 caracteres (5 dígitos + hífen + 3 dígitos)
};
