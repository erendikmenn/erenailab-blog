import { NextRequest } from 'next/server'
import { handleCSPReport } from '@/lib/security'

export async function POST(request: NextRequest) {
  return handleCSPReport(request)
}