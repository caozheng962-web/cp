// app/api/evaluations/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Evaluation, RoomSubmission } from '@/lib/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'evaluations.json');
const SUBMISSIONS_FILE = path.join(process.cwd(), 'data', 'submissions.json');

interface SubmissionRecord extends RoomSubmission {
  evaluatorId: string;
}

async function getEvaluations(): Promise<Evaluation[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function getSubmissions(): Promise<SubmissionRecord[]> {
  try {
    const data = await fs.readFile(SUBMISSIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveEvaluations(evaluations: Evaluation[]) {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(DATA_FILE, JSON.stringify(evaluations, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const submittedOnly = searchParams.get('submittedOnly') === 'true';

  let evaluations = await getEvaluations();

  if (submittedOnly) {
    const submissions = await getSubmissions();
    // Create a Set of valid (roomId, evaluatorId) keys
    const validKeys = new Set(
      submissions.map(s => `${s.roomId}-${s.evaluatorId}`)
    );

    evaluations = evaluations.filter(e => 
      validKeys.has(`${e.roomId}-${e.evaluatorId}`)
    );
  }

  return NextResponse.json(evaluations);
}

export async function POST(request: Request) {
// ... (rest is unchanged)
  const body = await request.json();
  const newEvaluation: Evaluation = body;
  
  if (!newEvaluation.evaluatorId) {
    return NextResponse.json({ error: 'Evaluator ID is required' }, { status: 400 });
  }

  const evaluations = await getEvaluations();
  
  // Update or append based on roomId, skuId, AND evaluatorId
  const index = evaluations.findIndex(
    (e) => e.roomId === newEvaluation.roomId && 
           e.skuId === newEvaluation.skuId && 
           e.evaluatorId === newEvaluation.evaluatorId
  );
  
  if (index !== -1) {
    evaluations[index] = { ...evaluations[index], ...newEvaluation };
  } else {
    evaluations.push(newEvaluation);
  }
  
  await saveEvaluations(evaluations);
  
  return NextResponse.json({ success: true });
}
