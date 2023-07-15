import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'NumberLessThan', async: false })
export class NumberLessThanConstraint implements ValidatorConstraintInterface {
  async validate(value: number, args: ValidationArguments) {
    const [field] = args.constraints;
    const otherField = args.object[field];

    if (typeof otherField !== 'number') return false;

    return value < otherField;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be less than ${
      args.object[args.constraints[0]]
    }`;
  }
}

export function NumberLessThan<T>(
  property: keyof T,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'NumberLessThan',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: NumberLessThanConstraint,
    });
  };
}
