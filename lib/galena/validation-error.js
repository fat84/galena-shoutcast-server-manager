import AppError from './app-error';

export default class ValidationError extends AppError {
  constructor (message, validation) {
    super(message);
    this.name = this.constructor.name;
    this.validation = validation;
  }
};
