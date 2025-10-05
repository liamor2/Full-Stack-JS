import { Model, Document, Types } from "mongoose";

export type ID = string | Types.ObjectId;

export class CrudService<T extends Document> {
  constructor(protected model: Model<T>) {}

  async create(data: Partial<T>) {
    const doc = await this.model.create(data as any);
    return doc;
  }

  async findAll(filter = {}) {
    return this.model.find(filter as any).exec();
  }

  async findById(id: ID) {
    return this.model.findById(id as any).exec();
  }

  async update(id: ID, data: Partial<T>) {
    return this.model.findByIdAndUpdate(id as any, data as any, { new: true }).exec();
  }

  async remove(id: ID) {
    return this.model.findByIdAndDelete(id as any).exec();
  }
}

export default CrudService;
