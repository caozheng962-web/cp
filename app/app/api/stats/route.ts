import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { LIVE_ROOMS } from '@/lib/mockData';

const SUBMISSIONS_FILE = path.join(process.cwd(), 'data', 'submissions.json');

export async function GET() {
  try {
    let submissions = [];
    try {
      const data = await fs.readFile(SUBMISSIONS_FILE, 'utf-8');
      submissions = JSON.parse(data);
    } catch (e) {
      // File might not exist
    }

    // Count distinct submissions per room
    // Since submissions.json stores { roomId, evaluatorId, ... }
    // A "completed evaluation" is one entry in submissions.json (assuming we only create it when all SKUs are done)
    
    const stats: Record<string, number> = {};
    
    // Initialize with 0
    LIVE_ROOMS.forEach(r => stats[r.id] = 0);

    submissions.forEach((s: any) => {
      if (stats[s.roomId] !== undefined) {
        stats[s.roomId]++;
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}
