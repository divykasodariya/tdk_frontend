"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"

interface Team {
  team_id: string
  team_name: string
  location: string
  coach_name: string
}

export default function TeamsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/teams")
        if (!response.ok) throw new Error("Failed to fetch teams")
        const data = await response.json()
        setTeams(data)
      } catch (err) {
        setError("Failed to load teams")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTeams()
    }
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🏏</div>
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button onClick={() => router.back()} variant="ghost" className="mb-4 text-primary hover:bg-primary/10">
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Teams</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded text-destructive">{error}</div>
        )}

        {teams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No teams available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team.team_id} className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{team.team_name}</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Location: {team.location}</p>
                  <p className="text-sm text-muted-foreground">Coach: {team.coach_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
