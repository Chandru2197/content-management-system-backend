import { Category } from './../../category/entities/category.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import slugify from 'slugify';
import * as mongoose from 'mongoose';
import { User } from 'src/user/entities/user.entity';

export interface Blog extends Document {
  tag: string[];
  title: string;
  category: Category;
  user: User;
  slug: string;
  description: string;
  timestamp: Date;
  imageUrl: string;
}

@Schema()
export class Blog {
  @Prop({ type: [String], required: true })
  tag: string[];

  @Prop({ required: true })
  title: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }] })
  category: Category;

  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } })
  author: User;

  @Prop({ default: '' })
  slug: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.pre<Blog>('save', function (next) {
  if (!this.isModified('title')) {
    return next();
  }
  this.slug = slugify(this.title, { lower: true });
  next();
});

export { BlogSchema };