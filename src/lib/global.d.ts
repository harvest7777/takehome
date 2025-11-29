import type { Database } from './database.types'

type PublicSchema = Database['public']

// Make types globally available
declare global {
  type StoredQuestion = PublicSchema['Tables']['questions']['Row']
  type StoredJudge = PublicSchema['Tables']['judge_configurations']['Row']
  type StoredAnswer = PublicSchema['Tables']['answers']['Row']
  type StoredSubmission = PublicSchema['Tables']['submissions']['Row']
  type JudgeEvaluation = PublicSchema['Enums']['judge_evaluation']
  type JudgingStatus = PublicSchema['Enums']['judging_status']
  type LLMModel = PublicSchema['Enums']['llm_model']
  type Agent = PublicSchema['Tables']['agent_configurations']['Row']
}

