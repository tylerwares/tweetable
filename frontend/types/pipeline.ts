export type StageLiteral = 'voice' | 'ideas' | 'angles' | 'tweets' | 'shitpost';

export interface VoiceProfile {
  voice_profile: string;
  stylistic_quirks: string[];
  persona: string;
}

export interface IdeaItem {
  title: string;
  summary: string;
  virality: number;
  relatability: number;
  emotional_punch: number;
}

export interface IdeasResponse {
  ideas: IdeaItem[];
}

export interface InsightAngle {
  idea_title: string;
  angle: string;
}

export interface InsightAnglesResponse {
  angles: InsightAngle[];
}

export interface TweetOutput {
  short_tweet: string;
  tweets: string[];
  threads: string[][];
}

export interface ShitpostResponse {
  shitpost: string;
}

export interface PipelineRunResponse {
  session_id: string;
  voice_profile: VoiceProfile;
  ideas: IdeasResponse;
  angles: InsightAnglesResponse;
  tweets: TweetOutput;
  shitpost?: ShitpostResponse | null;
}

export interface PipelineStageResponse {
  stage: StageLiteral;
  session_id: string;
  voice_profile?: VoiceProfile;
  ideas?: IdeasResponse;
  angles?: InsightAnglesResponse;
  tweets?: TweetOutput;
  shitpost?: ShitpostResponse;
}

export interface PipelineStageRequest {
  note_text?: string;
  voice_profile?: VoiceProfile;
  ideas?: IdeasResponse;
  angles?: InsightAnglesResponse;
  include_shitpost?: boolean;
  session_id?: string;
}
