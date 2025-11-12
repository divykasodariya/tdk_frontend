"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface Stadium {
  stadium_id: string
  stadium_name: string
}

interface Team {
  team_id: string
  team_name: string
}

interface CreateMatchModalProps {
  tournamentId: string
  onClose: () => void
  onSuccess: (match: any) => void
}

export default function CreateMatchModal({ tournamentId, onClose, onSuccess }: CreateMatchModalProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [stadiums, setStadiums] = useState<Stadium[]>([])
  const [formData, setFormData] = useState({
    team1_id: "",
    team2_id: "",
    stadium_id: "",
    start_time: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, stadiumsRes] = await Promise.all([
          fetch("http://localhost:5000/api/teams"),
          fetch("http://localhost:5000/api/stadiums"),
        ])

        if (!teamsRes.ok || !stadiumsRes.ok) throw new Error("Failed to fetch data")

        const teamsData = await teamsRes.json()
        const stadiumsData = await stadiumsRes.json()

        setTeams(teamsData)
        setStadiums(stadiumsData)
      } catch (err) {
        setError("Failed to load teams and stadiums")
        console.error(err)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tournament_id: tournamentId,
        }),
      })

      if (!response.ok) throw new Error("Failed to create match")
      const newMatch = await response.json()
      onSuccess(newMatch)
    } catch (err) {
      setError("Failed to create match. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">Add New Match</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded text-destructive text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Team 1</label>
            <select
              name="team1_id"
              value={formData.team1_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.team_id} value={team.team_id}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Team 2</label>
            <select
              name="team2_id"
              value={formData.team2_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.team_id} value={team.team_id}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Stadium</label>
            <select
              name="stadium_id"
              value={formData.stadium_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">Select a stadium</option>
              {stadiums.map((stadium) => (
                <option key={stadium.stadium_id} value={stadium.stadium_id}>
                  {stadium.stadium_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 bg-background hover:bg-muted">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Creating..." : "Create Match"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
