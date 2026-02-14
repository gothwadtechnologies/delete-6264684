
export interface AppItem {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  price?: string;
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}
