import type { Database } from './database.types'

type PublicSchema = Database['public']

export type JudgeEvaluation = PublicSchema['Enums']['judge_evaluation']
export type JudgingStatus = PublicSchema['Enums']['judging_status']
export type LLMModel = PublicSchema['Enums']['llm_model']

