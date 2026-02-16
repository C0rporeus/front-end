export type Skill = {
  id: string;
  title: string;
  summary: string;
  body: string;
  imageUrls: string[];
  tags: string[];
  visibility: "public" | "private";
  createdAt: string;
  updatedAt: string;
};

export type SkillPayload = {
  title: string;
  summary: string;
  body: string;
  imageUrls: string[];
  tags: string[];
  visibility: "public" | "private";
};
