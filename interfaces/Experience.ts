export type Experience = {
  id: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  visibility: "public" | "private";
  createdAt: string;
  updatedAt: string;
};

export type ExperiencePayload = {
  title: string;
  summary: string;
  body: string;
  tags: string[];
  visibility: "public" | "private";
};
