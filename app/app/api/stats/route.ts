import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { LIVE_ROOMS } from '@/lib/mockData';

const SUBMISSIONS_FILE = path.join(process.cwd(), 'data', 'submissions.json');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const evaluatorId = searchParams.get('evaluatorId');

  try {
    let submissions = [];
    try {
      const data = await fs.readFile(SUBMISSIONS_FILE, 'utf-8');
      submissions = JSON.parse(data);
    } catch (e) {
      // File might not exist
    }

    const stats: Record<string, number> = {};
    
    LIVE_ROOMS.forEach(r => stats[r.id] = 0);

    submissions.forEach((s: any) => {
      // If evaluatorId is provided, only count if it matches
      if (evaluatorId && s.evaluatorId !== evaluatorId) {
        return;
      }

      if (stats[s.roomId] !== undefined) {
        stats[s.roomId]++;
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}
