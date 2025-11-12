"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import MatchCard from "@/components/match-card"
import CreateMatchModal from "@/components/create-match-modal"

interface Match {
  match_id: string
  team1_id: string
  team2_id: string
  team1_name: string
  team2_name: string
  team1_score: number
  team2_score: number
  status: string
  start_time: string
  stadium_id: string
  stadium_name: string
}

interface Tournament {
  tournament_id: string
  tournament_name: string
  location: string
  start_date: string
  end_date: string
}

export default function TournamentDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateMatch, setShowCreateMatch] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tournamentResponse = await fetch(`http://localhost:5000/api/tournaments/${params.id}`)
        if (!tournamentResponse.ok) throw new Error("Failed to fetch tournament")
        const tournamentData = await tournamentResponse.json()
        setTournament(tournamentData)

        const matchesResponse = await fetch(`http://localhost:5000/api/matches/tournament/${params.id}`)
        if (!matchesResponse.ok) throw new Error("Failed to fetch matches")
        const matchesData = await matchesResponse.json()
        setMatches(matchesData)
      } catch (err) {
        setError("Failed to load tournament details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user && params.id) {
      fetchData()
    }
  }, [user, params.id])

  const handleMatchCreated = (newMatch: Match) => {
    setMatches([...matches, newMatch])
    setShowCreateMatch(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🏏</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Tournament not found</p>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            onClick={() => router.push("/tournaments")}
            variant="ghost"
            className="mb-4 text-primary hover:bg-primary/10"
          >
            ← Back to Tournaments
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{tournament.tournament_name}</h1>
              <p className="text-muted-foreground mt-1">{tournament.location}</p>
            </div>
            {user?.is_admin && (
              <Button
                onClick={() => setShowCreateMatch(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                + Add Match
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded text-destructive">{error}</div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Matches</h2>
          {matches.length === 0 ? (
            <div className="text-center py-12 bg-muted/50 rounded-lg border border-border">
              <p className="text-muted-foreground">No matches yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <MatchCard key={match.match_id} match={match} onClick={() => router.push(`/match/${match.match_id}`)} />
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateMatch && (
        <CreateMatchModal
          tournamentId={params.id as string}
          onClose={() => setShowCreateMatch(false)}
          onSuccess={handleMatchCreated}
        />
      )}
    </div>
  )
}
