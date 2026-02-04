import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { LIVE_ROOMS } from '@/lib/mockData';
import { RoomSubmission } from '@/lib/types';

const SUBMISSIONS_FILE = path.join(process.cwd(), 'data', 'submissions.json');

interface SubmissionRecord extends RoomSubmission {
  evaluatorId: string;
}

export async function GET() {
  try {
    let submissions: SubmissionRecord[] = [];
    try {
      const data = await fs.readFile(SUBMISSIONS_FILE, 'utf-8');
      submissions = JSON.parse(data);
    } catch (e) {
      // File might not exist
      return NextResponse.json([]);
    }

    // Aggregate by evaluatorId
    const evaluatorStats: Record<string, {
      id: string;
      department: string;
      name: string;
      completedCount: number;
      rooms: Set<string>;
      lastSubmission: number;
    }> = {};

    submissions.forEach(sub => {
      const { evaluatorId, roomId, submittedAt } = sub;
      
      if (!evaluatorStats[evaluatorId]) {
        // Parse "Department-Name"
        const [dept, ...nameParts] = evaluatorId.split('-');
        const name = nameParts.join('-'); // In case name has hyphens
        
        evaluatorStats[evaluatorId] = {
          id: evaluatorId,
          department: dept || 'Unknown',
          name: name || evaluatorId,
          completedCount: 0,
          rooms: new Set(),
          lastSubmission: 0
        };
      }

      const stats = evaluatorStats[evaluatorId];
      stats.completedCount++;
      
      const roomName = LIVE_ROOMS.find(r => r.id === roomId)?.name || roomId;
      stats.rooms.add(roomName);

      if (submittedAt > stats.lastSubmission) {
        stats.lastSubmission = submittedAt;
      }
    });

    const result = Object.values(evaluatorStats).map(stat => ({
      ...stat,
      rooms: Array.from(stat.rooms) // Convert Set to Array
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch evaluators' }, { status: 500 });
  }
}
