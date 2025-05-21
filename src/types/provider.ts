export type Feature = {
  name: string;
  description: string;
  icon: string;
  color: string;
};

export type Model = {
  id: string;
  name: string;
  features?: Feature[];
  free?: boolean;
};

export type Provider = {
  name: string;
  icon: string;
  models: Model[];
};
