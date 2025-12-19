export interface BubbleMessage {
  id: string;
  text: string;
  x: number; // Percentage 0-100
  size: number; // Scale factor
  delay: number;
  duration: number;
  color: string;
  highlight?: boolean; // local-only emphasis bubble
}

export interface AiResponse {
  message: string;
}

export interface UserInfo {
  name: string;
  school: string;
  isAnonymous?: boolean;
}

export enum AppState {
  INTRO = 'INTRO',
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SHOW_WISH = 'SHOW_WISH',
}