const request = require('supertest');

const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('should sign up a new user', async () => {
  const userData = {
    name: 'Andrew',
    email: 'andrew@example.com',
    password: 'MyPassword',
  };

  const response = await request(app).post('/users').send(userData).expect(201);

  // Assert that the database was changed successfully
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: userData.name,
      email: userData.email,
    },
    token: user.tokens[0].token,
  });
  expect(user.password).not.toBe(userData.password);
});

test('should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(response.body.user._id);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('should not login not existing user or with incorrect credentials', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'test-not-existing@user.com',
      password: 'Qwerty123$',
    })
    .expect(400);
});

test('should get profile user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('should not get profile user without token', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('should delete account for user', async () => {
  const response = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(response.body._id);
  expect(user).toBeNull();
});

test('should not delete account for user without token', async () => {
  await request(app).delete('/users/me').send().expect(401);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('should update user field', async () => {
  const name = 'New name';

  const response = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ name })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toBe(name);
});

test('should not update invalid field', async () => {
  const location = 'New name';

  const response = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ location })
    .expect(400);
});
