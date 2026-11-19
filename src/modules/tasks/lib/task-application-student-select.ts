export const taskApplicationStudentSelect = {
  aboutMe: true,
  skills: true,
  ratingSum: true,
  ratingCount: true,
  user: {
    select: { name: true, surname: true },
  },
} as const;

export const taskApplicationAcceptedStudentSelect = {
  aboutMe: true,
  skills: true,
  ratingSum: true,
  ratingCount: true,
  user: {
    select: { name: true, surname: true, email: true },
  },
} as const;
