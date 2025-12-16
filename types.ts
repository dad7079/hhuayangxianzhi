export interface Volume {
  id: string;
  title: string;
  original: string;   // HTML content
  annotation: string; // HTML content
  translation: string;// HTML content
}

export type ContentType = 'original' | 'annotation' | 'translation';

export interface User {
  username: string;
  isAdmin: boolean;
}