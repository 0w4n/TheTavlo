import type { Firestore } from "firebase/firestore";
import type { User } from "#core/auth/domain/user.entity";
import type { CalendarRepository } from "../app/calendarRepository.interface";
import type { Calendar, CreateCalendarDTO, UpdateCalendarDTO } from "../domain/calendar.entity";

export class FirebaseCalendarRepository implements CalendarRepository{
  constructor(
    private firestore: Firestore,
    private getCurrentUser: () => User | undefined,
  ) {}

  private getCollectionPath(): string {
    return `calendar`;
  }

  private getUser(): User {
    const ctx = this.getCurrentUser();

    if (!ctx) {
      throw new Error("calendarUserContext no disponible");
    }

    return ctx;
  }

  // CREATE
  async create(data: CreateCalendarDTO): Promise<Calendar> {
    
  }

  // READ
    async findByToken(token: string): Promise<Calendar> {
    
  }

  // UPDATE
    async update(token: string, data: UpdateCalendarDTO): Promise<Calendar> {
    
  }

  // DELETE
    async delete(token: string): Promise<void> {
    
  }

}
