export type ValidationRule = {
  test: (value: string) => boolean;
  error: string;
};

export const validationRules: { [key: string]: ValidationRule } = {
  name: {
    test: (value: string) => value.length >= 5,
    error: "El nombre debe tener al menos 5 caracteres",
  },
  email: {
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    error: "Introduce un correo electrónico válido",
  },
  message: {
    test: (value: string) => value.length <= 180,
    error: "El mensaje no puede tener más de 180 caracteres",
  },
};
