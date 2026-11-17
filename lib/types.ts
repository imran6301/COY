export type Profile = {
  id: number;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string; // city or college
  interests: string[];
  likesMe: boolean; // true = this profile already liked the logged-in user
};

export type SwipeAction = "like" | "pass";

export type Swipe = {
  profileId: number;
  action: SwipeAction;
  createdAt: string;
};