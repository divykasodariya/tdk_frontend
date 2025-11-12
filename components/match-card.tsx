"use client"

import { Card } from "@/components/ui/card"

interface Match {
  match_id: string
  team1_name: string
  team2_name: string
  team1_score: number
  team2_score: number
  status: string
  start_time: string
  stadium_name: string
}

export default function MatchCard({
  match,
  onClick,
}: {
  match: Match
  onClick: () => void
}) {
  const isLive = match.status.toLowerCase() === "ongoing"
  const matchDate = new Date(match.start_time)

  return (
    <Card
      onClick={onClick}
      className="bg-card hover:shadow-lg transition-shadow cursor-pointer border border-border overflow-hidden"
    >
      {isLive && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
          Live Match
        </div>
      )}

      <div className="p-6">
        <div className="text-center mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {matchDate.toLocaleDateString()} {matchDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1 text-center">
            <p className="font-bold text-foreground">{match.team1_name}</p>
            <p className="text-2xl font-bold text-primary mt-2">{match.team1_score}</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-muted-foreground font-medium">vs</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {match.status}
            </span>
          </div>

          <div className="flex-1 text-center">
            <p className="font-bold text-foreground">{match.team2_name}</p>
            <p className="text-2xl font-bold text-accent mt-2">{match.team2_score}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">📍 {match.stadium_name}</p>
          <button className="w-full mt-3 py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            View Details
          </button>
        </div>
      </div>
    </Card>
  )
}
