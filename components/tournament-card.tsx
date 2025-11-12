"use client"

import { Card } from "@/components/ui/card"

interface Tournament {
  tournament_id: string
  tournament_name: string
  location: string
  start_date: string
  end_date: string
  admin_name: string
}

export default function TournamentCard({
  tournament,
  onClick,
}: {
  tournament: Tournament
  onClick: () => void
}) {
  const startDate = new Date(tournament.start_date)
  const endDate = new Date(tournament.end_date)

  return (
    <Card
      onClick={onClick}
      className="bg-card hover:shadow-lg transition-shadow cursor-pointer border border-border p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-foreground flex-1">{tournament.tournament_name}</h3>
        <span className="text-2xl">🏏</span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
          <p className="text-foreground font-medium">{tournament.location}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Start Date</p>
            <p className="text-foreground font-medium">{startDate.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">End Date</p>
            <p className="text-foreground font-medium">{endDate.toLocaleDateString()}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Organizer</p>
          <p className="text-foreground font-medium">{tournament.admin_name}</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
          View Tournament
        </button>
      </div>
    </Card>
  )
}
