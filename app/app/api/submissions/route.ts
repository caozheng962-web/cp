import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { RoomSubmission } from '@/lib/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'submissions.json');

// Define a type that includes evaluatorId for submission tracking
interface SubmissionRecord extends RoomSubmission {
  evaluatorId: string;
}

async function getSubmissions(): Promise<SubmissionRecord[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveSubmissions(submissions: SubmissionRecord[]) {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(DATA_FILE, JSON.stringify(submissions, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const evaluatorId = searchParams.get('evaluatorId');
  const roomId = searchParams.get('roomId');

  let submissions = await getSubmissions();

  if (evaluatorId) {
    submissions = submissions.filter(s => s.evaluatorId === evaluatorId);
  }
  if (roomId) {
    submissions = submissions.filter(s => s.roomId === roomId);
  }

  return NextResponse.json(submissions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newSubmission: SubmissionRecord = body;
  
  if (!newSubmission.evaluatorId) {
    return NextResponse.json({ error: 'Evaluator ID is required' }, { status: 400 });
  }

  const submissions = await getSubmissions();
  
  // Check if already submitted
  const exists = submissions.some(
    (s) => s.roomId === newSubmission.roomId && s.evaluatorId === newSubmission.evaluatorId
  );
  
  if (!exists) {
    submissions.push(newSubmission);
    await saveSubmissions(submissions);
  }
  
  return NextResponse.json({ success: true });
}
