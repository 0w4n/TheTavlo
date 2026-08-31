import { type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";
import { type Task } from "./task.entity";
export declare class TaskRules {
    static canComplete(task: Task): boolean;
    static isOverdue(task: Task): boolean;
    static validateTitle(title: string): ResultApp<string, AppErr>;
    static validateDueDate(date: Date): ResultApp<Date, AppErr>;
}
