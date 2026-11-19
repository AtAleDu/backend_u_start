export const taskCompanySelect = {
  companyName: true,
  description: true,
  user: {
    select: {
      email: true,
      name: true,
      surname: true,
    },
  },
} as const;
