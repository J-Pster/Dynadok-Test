export abstract class BaseEntity<T> {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: T) {
    Object.assign(this, props);
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();
  }
}
