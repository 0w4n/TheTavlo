import { FeatureMapper, type Mapper } from "#core/appCore/domain/AppCore.mapper";
import type { CreateAnyTaskDTO, Task } from "./task.entity";

export const TaskMapper: Mapper<Task, CreateAnyTaskDTO> = FeatureMapper