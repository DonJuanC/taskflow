export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  order?: number;
  frequency?: "daily" | "weekly" | "monthly";
}
