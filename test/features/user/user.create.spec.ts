import { describe, expect, test } from 'vitest'
import { CreateUserUsecase } from '../../../src/features/user/usecases/user.create.usecase'
import { compare, hash } from 'bcryptjs'
import { inMemoryUsersRepository } from '../../../src/features/user/repositories/in.memory/in.memory.users.repository'
import { UserAlreadyExists } from '../../../src/features/user/usecases/errors/user.already.exists.error'

describe('Create user usecase', () => {
  test('It must be possible to register the user', async () => {
    const userRepository = new inMemoryUsersRepository()
    const createUsecase = new CreateUserUsecase(userRepository)

    const { user } = await createUsecase.execute({
      name: 'lucas',
      email: 'lucas@gmail.com',
      password: '123456'
    })

    expect(user.id).toEqual(expect.any(String))
  })

  test('The user password must be hashed', async () => {
    const userRepository = new inMemoryUsersRepository()
    const createUsecase = new CreateUserUsecase(userRepository)

    const { user } = await createUsecase.execute({
      name: 'lucas',
      email: 'lucas@gmail.com',
      password: '123456'
    })

    const isPasswordCorrectlyHash = await compare(
      '123456',
      user.passwordHash
    )

    expect(isPasswordCorrectlyHash).toBe(true)
  })

  test("There cannot be a user with a repeated email", async () => {
    const userRepository = new inMemoryUsersRepository()
    const createUsecase = new CreateUserUsecase(userRepository)

    const email = 'lucas@example.com'

    await createUsecase.execute({
      name: 'lucas',
      email,
      password: '123456'
    })

    expect(() => 
      createUsecase.execute({
        name: 'lucas',
        email,
        password: '123456'
    }),
    ).rejects.toBeInstanceOf(UserAlreadyExists)
  })
})