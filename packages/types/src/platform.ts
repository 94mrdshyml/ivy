export enum Platform {
  INSTAGRAM = "INSTAGRAM",
  FACEBOOK = "FACEBOOK",
  YOUTUBE = "YOUTUBE",
}

export interface Creator {
  id: string;
  email: string;
  name?: string;
  handle?: string;
  createdAt: Date;
  updatedAt: Date;
}
