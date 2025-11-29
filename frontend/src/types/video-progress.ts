export interface VideoProgressDto {
  id: number;
  userId: number;
  lessonId: number;
  currentTimeSeconds: number;
  durationSeconds: number;
  completionPercentage: number;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveProgressRequest {
  currentTimeSeconds: number;
  durationSeconds: number;
  completionPercentage: number;
  isCompleted: boolean;
}
