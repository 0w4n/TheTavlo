import type {
  Calendar,
  CreateCalendarDTO,
  UpdateCalendarDTO,
} from "../domain/calendar.entity";

export interface CalendarRepository {
  findByToken(token: string): Promise<Calendar>;
  create(data: CreateCalendarDTO): Promise<Calendar>;
  update(token: string, data: UpdateCalendarDTO): Promise<Calendar>;
  delete(token: string): Promise<void>;
}
