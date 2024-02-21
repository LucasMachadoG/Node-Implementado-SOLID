import { CheckIn, Prisma } from "@prisma/client";
import { CheckInRepository } from "../../contract/checkin.contract";
import { randomUUID } from "node:crypto";

export class inMemoryCheckInsRepository implements CheckInRepository{
  public itens: CheckIn[] = []

  public async create(data: Prisma.CheckInUncheckedCreateInput) {
    const currentDate = new Date();

    const checkin = {
      id: randomUUID(),
      userId: data.userId,
      gymId: data.gymId,
      validatedAt: data.validatedAt ? new Date(data.validatedAt) : null,
      createdAt: currentDate
    }

    this.itens.push(checkin)

    return checkin
  }
}