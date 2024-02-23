import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest'
import { inMemoryCheckInsRepository } from '../../../src/features/checkIn/repositories/in.memory./in.memory.checkin.repository'
import { CheckInUsecase } from '../../../src/features/checkIn/usecase/checkin.usecase'
import { inMemoryGymsRepository } from '../../../src/features/gym/repositories/in.memory/in.memory.gym.repository'
import { Decimal } from '@prisma/client/runtime/library'
import exp from 'constants'

let checkinRepository: inMemoryCheckInsRepository
let gymRepository: inMemoryGymsRepository
let sut: CheckInUsecase

describe('CheckIn usecase', () => {
  beforeEach(() => {
    checkinRepository = new inMemoryCheckInsRepository()
    gymRepository = new inMemoryGymsRepository()
    sut = new CheckInUsecase(checkinRepository, gymRepository)

    gymRepository.itens.push({
      id: 'gym_01',
      title: 'TesteGym',
      description: '',
      latitude: new Decimal(-27.2092052),
      longitude: new Decimal(-49.6401091),
      phone: ''
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })
  
  test('Should be able to checkin', async () => {
    const { checkin } = await sut.execute({
      gymId: 'gym_01',
      userId: 'user_01',
      userLatitude: -27.2092052,
      userLongitude: -49.6401091
    })

    expect(checkin.id).toEqual(expect.any(String))
  })

  test('Should not be able to checkin in twice in the same day', async () => {
    vi.setSystemTime(new Date(2022, 0, 15, 8, 0, 0))

    await sut.execute({
      gymId: 'gym_01',
      userId: 'user_01',
      userLatitude: -27.2092052,
      userLongitude: -49.6401091
    })

    await expect(() => 
      sut.execute({
        gymId: 'gym_01',
        userId: 'user_01',
        userLatitude: -27.2092052,
        userLongitude: -49.6401091
      })
    ).rejects.toBeInstanceOf(Error)
  })

  test('Should be able to checkin in twice but in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 15, 8, 0, 0))

    await sut.execute({
      gymId: 'gym_01',
      userId: 'user_01',
      userLatitude: -27.2092052,
      userLongitude: -49.6401091
    })

    vi.setSystemTime(new Date(2022, 0, 24, 8, 0, 0))

    const { checkin } = await sut.execute({
      gymId: 'gym_01',
      userId: 'user_01',
      userLatitude: -27.2092052,
      userLongitude: -49.6401091
    })

    expect(checkin.id).toEqual(expect.any(String))
  })

  test('Should not be able to check in on distant gym', async () => {
    gymRepository.itens.push({
      id: 'gym_02',
      title: 'TesteGym',
      description: '',
      latitude: new Decimal(-29.5869542),
      longitude: new Decimal(-51.2052155),
      phone: ''
    })

    await expect(() => 
      sut.execute({
        gymId: 'gym_02',
        userId: 'user_01',
        userLatitude: -27.2092052,
        userLongitude: -49.6401091
      })
    ).rejects.toBeInstanceOf(Error)
  })
})