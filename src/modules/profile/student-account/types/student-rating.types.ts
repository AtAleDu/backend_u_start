export type StudentRatingHistoryItem = {
  taskId: string;
  taskTitle: string;
  companyName: string | null;
  rating: number;
  completedAt: string;
};

export type StudentRatingDetailResponse = {
  ratingSum: number;
  ratingCount: number;
  history: StudentRatingHistoryItem[];
};
