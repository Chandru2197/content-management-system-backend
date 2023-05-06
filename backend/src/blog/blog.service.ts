import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class BlogService {
  constructor(@InjectModel('Blog') private readonly blogModel: Model<Blog>) {}

  async create(createBlogDto: CreateBlogDto, user: JwtPayload): Promise<Blog> {
    const createdBlog = new this.blogModel({
      ...createBlogDto,
      author: user._id,
    });
    return createdBlog.save();
  }

  async findAll(page: number = 1, limit: number = 5) {
    const skip = (page - 1) * limit; // calculate how many posts to skip based on page and limit
    const total = await this.blogModel.countDocuments(); // get the total number of posts
    const blogs = await this.blogModel.find().skip(skip).limit(limit).exec(); // get the posts for the current page

    return {
      data: blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    };
  }

  async findByIdCategoryAndSlug(
    id: string,
    category: string,
    slug: string,
  ): Promise<Blog> {
    return await this.blogModel
      .findOne({
        _id: id,
        category: category,
        slug: slug,
      })
      .exec();
  }

  // async getBlogsByCategory(category: string, limit: number): Promise<Blog[]> {
  //   return this.blogModel
  //     .find({ category })
  //     .sort({ createdAt: 'desc' })
  //     .limit(limit)
  //     .exec();
  // }

  async getPostById(postId: string): Promise<Blog> {
    const post = await this.blogModel.findById(postId).exec();
    return post;
  }

  async findSimilarBlogs(blog: Blog): Promise<Blog[]> {
    const similarBlogs = await this.blogModel
      .find({
        category: blog.category,
        _id: { $ne: blog._id }, // exclude the current blog post from the results
      })
      .sort({ createdAt: -1 }) // sort by creation date in descending order
      .limit(3) // limit to a maximum of 3 similar posts
      .exec();

    return similarBlogs;
  }
}
