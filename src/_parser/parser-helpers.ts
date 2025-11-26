import { supabase } from "@/lib/supabase";

export type Submission = {
  id: string;
  queueId: string;
  labelingTaskId: string;
  createdAt: number;
  questions: Array<{
    rev: number;
    data: {
      id: string;
      questionType: string;
      questionText: string;
      [key: string]: unknown; // Allow any additional fields
    };
    [key: string]: unknown; // Allow additional fields on question object too
  }>;
  answers: Record<string, Record<string, unknown>>; // Flexible answer structure
  [key: string]: unknown; // Allow any other top-level fields
};

export async function parseInputJson(inputJson: string): Promise<void> {
    const json = JSON.parse(inputJson) as Submission[];
    
    if (!Array.isArray(json)) {
        console.warn('Expected array of submissions, got:', typeof json);
        return;
    }
    
    for (const submission of json) {
        try {
            await parseQuestionsAndAnswersFromSubmission(submission);
        } catch (error) {
            console.warn(`Failed to process submission ${submission.id}:`, error);
            // Continue with next submission
        }
    }
}

export async function parseQuestionsAndAnswersFromSubmission(submission: Submission): Promise<void> {
    const storedSubmission: StoredSubmission = {
        id: submission.id,
        queue_id: submission.queueId,
        created_at: new Date(Number(submission.createdAt)).toISOString(),
    };
    
    // First store the submission to the db
    const { error: submissionError } = await supabase
        .from('submissions')
        .insert(storedSubmission);

    if (submissionError) {
        console.warn(`Failed to insert submission ${submission.id}:`, submissionError.message);
    }

    // Questions and answers for this submission
    const questions = submission['questions'];
    const answers = submission['answers'];
    for (const question of questions) {
        const storedQuestion: StoredQuestion = {
            submission_id: submission.id,
            status: 'QUEUED',
            question_id: question['data']['id'],
            question_data: JSON.stringify(question['data']),
            created_at: new Date().toISOString(),
        }
        const { error: questionError } = await supabase.from('questions').insert(storedQuestion);
        if (questionError) {
            console.warn(`Failed to insert question ${question['data']['id']}:`, questionError.message);
            continue; // Skip this question and continue with next
        }

        const answer = answers[question['data']['id']];
        if (answer) {
            const storedAnswer: StoredAnswer = {
                question_id: question['data']['id'],
                submission_id: submission.id,
                answer_data: JSON.stringify(answer),
                created_at: new Date().toISOString(),
            };
            const { error: answerError } = await supabase.from('answers').insert(storedAnswer);
            if (answerError) {
                console.warn(`Failed to insert answer for question ${question['data']['id']}:`, answerError.message);
                // Continue with next question
            }
        } else {
            console.warn(`No answer found for question ${question['data']['id']}`);
        }
    }
}
// If you have it as a string
export const jsonStringSubmission = `[
 {
    "id": "sub_1",
    "queueId": "queue_1",
    "labelingTaskId": "task_1",
    "createdAt": 1690000000000,
    "questions": [
      {
        "rev": 1,
        "data": {
          "id": "q_template_1",
          "questionType": "single_choice_with_reasoning",
          "questionText": "Is the sky blue?"
        }
      }
    ],
    "answers": {
      "q_template_1": {
        "choice": "yes",
        "reasoning": "Observed on a clear day."
      }
    }
}]`;

parseQuestionsAndAnswersFromSubmission(JSON.parse(jsonStringSubmission));