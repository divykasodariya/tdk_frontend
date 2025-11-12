"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"

interface Player {
  player_id: string
  player_name: string
  runs: number
  balls: number
  wicket: boolean
}

interface MatchDetails {
  match_id: string
  team1_name: string
  team2_name: string
  team1_score: number
  team2_score: number
  team1_overs: number
  team2_overs: number
  status: string
  stadium_name: string
  striker: string
  non_striker: string
}

export default function MatchDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [match, setMatch] = useState<MatchDetails | null>(null)
  const [team1Players, setTeam1Players] = useState<Player[]>([])
  const [team2Players, setTeam2Players] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const matchResponse = await fetch(`http://localhost:5000/api/matches/${params.id}`)
        if (!matchResponse.ok) throw new Error("Failed to fetch match")
        const matchData = await matchResponse.json()
        setMatch(matchData)
      } catch (err) {
        setError("Failed to load match details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    // WebSocket connection for live updates
    const connectWebSocket = () => {
      const ws = new WebSocket("ws://localhost:5000/api/matches/summary")

      ws.onopen = () => {
        console.log("[v0] WebSocket connected for live updates")
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.match_id === params.id) {
            setMatch((prev) => (prev ? { ...prev, ...data } : null))
          }
        } catch (e) {
          console.error("[v0] WebSocket message parse error:", e)
        }
      }

      ws.onerror = (error) => {
        console.error("[v0] WebSocket error:", error)
      }

      ws.onclose = () => {
        console.log("[v0] WebSocket closed, reconnecting in 3s...")
        setTimeout(connectWebSocket, 3000)
      }

      return ws
    }

    if (user && params.id) {
      fetchMatchData()
      const ws = connectWebSocket()
      return () => ws.close()
    }
  }, [user, params.id])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🏏</div>
          <p className="text-muted-foreground">Loading match details...</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Match not found</p>
          <Button
            onClick={() => router.push("/tournaments")}
            className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Back to Tournaments
          </Button>
        </div>
      </div>
    )
  }

  const isLive = match.status.toLowerCase() === "ongoing"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button onClick={() => router.back()} variant="ghost" className="mb-4 text-primary hover:bg-primary/10">
            ← Back
          </Button>

          {isLive && (
            <div className="inline-block mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-destructive text-destructive-foreground rounded-full text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                Live Match
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded text-destructive">{error}</div>
        )}

        {/* Score Board */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-border rounded-lg p-8 mb-8">
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm">Status: {match.status}</p>
          </div>

          <div className="grid grid-cols-3 gap-8 items-center">
            {/* Team 1 */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">{match.team1_name}</h2>
              <div className="text-5xl font-bold text-primary mb-2">{match.team1_score}</div>
              <p className="text-muted-foreground text-sm">{match.team1_overs} overs</p>
            </div>

            {/* VS Badge */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xl text-primary-foreground">vs</span>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Cricket Match</p>
            </div>

            {/* Team 2 */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">{match.team2_name}</h2>
              <div className="text-5xl font-bold text-accent mb-2">{match.team2_score}</div>
              <p className="text-muted-foreground text-sm">{match.team2_overs} overs</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">📍 {match.stadium_name}</p>
          </div>
        </div>

        {/* Live Info */}
        {isLive && (
          <div className="bg-muted/50 border border-border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Current Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Striker</p>
                <p className="text-foreground font-semibold">{match.striker || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Non-Striker</p>
                <p className="text-foreground font-semibold">{match.non_striker || "N/A"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Team 1 Stats */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">{match.team1_name} Players</h3>
            <div className="space-y-2">
              {team1Players.length === 0 ? (
                <p className="text-muted-foreground text-sm">No player data available</p>
              ) : (
                team1Players.map((player) => (
                  <div key={player.player_id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-foreground">{player.player_name}</p>
                      {player.wicket && (
                        <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">Out</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Runs: {player.runs}</span>
                      <span className="text-muted-foreground">Balls: {player.balls}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Team 2 Stats */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">{match.team2_name} Players</h3>
            <div className="space-y-2">
              {team2Players.length === 0 ? (
                <p className="text-muted-foreground text-sm">No player data available</p>
              ) : (
                team2Players.map((player) => (
                  <div key={player.player_id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-foreground">{player.player_name}</p>
                      {player.wicket && (
                        <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">Out</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Runs: {player.runs}</span>
                      <span className="text-muted-foreground">Balls: {player.balls}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
