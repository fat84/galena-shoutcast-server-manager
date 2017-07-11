import ExtendableError from 'es6-error';

export default class AppError extends ExtendableError {
  constructor (message) {
    super(message);
    this.name = this.constructor.name;
  }
};
