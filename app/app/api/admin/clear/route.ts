import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const EVALUATIONS_FILE = path.join(process.cwd(), 'data', 'evaluations.json');
const SUBMISSIONS_FILE = path.join(process.cwd(), 'data', 'submissions.json');

export async function POST() {
  try {
    // Check if files exist before deleting to avoid errors, or just use unlink and ignore error
    try {
      await fs.unlink(EVALUATIONS_FILE);
    } catch (e) {}

    try {
      await fs.unlink(SUBMISSIONS_FILE);
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 });
  }
}
