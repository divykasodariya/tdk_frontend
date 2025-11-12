"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import TournamentCard from "@/components/tournament-card"
import CreateTournamentModal from "@/components/create-tournament-modal"
import { toast } from "sonner"

interface Tournament {
  tournament_id: string
  tournament_name: string
  location: string
  start_date: string
  end_date: string
  admin_user_id: string
  admin_name: string
}

export default function TournamentsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

useEffect(() => {
  const fetchTournaments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tournaments")

      // If API itself failed (e.g., 500)
      if (!response.ok && response.status !== 404) {
        throw new Error("Failed to fetch tournaments")
      }

      // If 404, treat it as empty — don't throw an error
      if (response.status === 404) {
        setTournaments([]) // no data
        setError("") // clear previous errors
        return
      }

      // Try parsing safely
      const resData = await response.json()

      // Handle case where backend sends success: false or empty data
      if (!resData.success || !Array.isArray(resData.data)) {
        setTournaments([])
        return
      }

      setTournaments(resData.data)
    } catch (err) {
      console.error("Error fetching tournaments:", err)
      setError("Failed to load tournaments")
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    fetchTournaments()
  }
}, [user])


  const handleTournamentCreated = (newTournament: Tournament) => {
    setTournaments([...tournaments, newTournament])
    setShowCreateModal(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🏏</div>
          <p className="text-muted-foreground">Loading tournaments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏏</span>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Cricket Manager</h1>
                <p className="text-xs text-muted-foreground">Tournament Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user?.username}</p>
                {user?.is_admin && <p className="text-xs text-primary">Admin</p>}
              </div>
              <Button onClick={handleLogout} variant="outline" className="bg-background hover:bg-muted">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Tournaments</h2>
            <p className="text-muted-foreground">Manage and view cricket tournaments</p>
          </div>
          {user?.is_admin && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              + New Tournament
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded text-destructive">{error}</div>
        )}

        {tournaments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No tournaments yet</p>
            {user?.is_admin && <p className="text-sm text-muted-foreground mt-2">Create one to get started</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.tournament_id}
                tournament={tournament}
                onClick={() => router.push(`/tournament/${tournament.tournament_id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateTournamentModal onClose={() => setShowCreateModal(false)} onSuccess={handleTournamentCreated} />
      )}
    </div>
  )
}
