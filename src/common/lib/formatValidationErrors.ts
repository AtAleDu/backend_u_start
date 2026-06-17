import { ValidationError } from 'class-validator';

export function formatValidationErrors(
  errors: ValidationError[],
): string[] {
  return errors.flatMap((error) => {
    if (error.constraints) {
      return Object.entries(error.constraints).map(([key, message]) => {
        if (
          key === 'whitelistValidation' ||
          message.endsWith(' should not exist')
        ) {
          return `Поле «${error.property}» не разрешено`;
        }

        return message;
      });
    }

    if (error.children?.length) {
      return formatValidationErrors(error.children);
    }

    return ['Некорректные данные'];
  });
}
