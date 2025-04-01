// app/api/research/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  const res = await fetch(`https://crypto-research-agent-api-yvc3.onrender.com/research?token=${token}`)
  const data = await res.json()
  console.log("✅ Token data received in frontend:", data)

  return NextResponse.json(data)
}
