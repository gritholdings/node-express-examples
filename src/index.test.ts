import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from './index';

const prisma = new PrismaClient();

describe('POST /signup', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new user with posts', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      posts: [
        {
          title: 'Post 1',
          content: 'Content of post 1',
        },
        {
          title: 'Post 2',
          content: 'Content of post 2',
        },
      ],
    };

    const response = await request(app)
      .post('/signup')
      .send(userData)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(userData.name);
    expect(response.body.email).toBe(userData.email);

    // Check if posts were created
    const createdUser = await prisma.user.findUnique({
      where: { email: userData.email },
      include: { posts: true },
    });

    expect(createdUser?.posts.length).toBe(userData.posts.length);

    // Clean up the created user and posts
    await prisma.user.delete({
      where: { email: userData.email },
    });
  });
});