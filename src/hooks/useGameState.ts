import { useState, useCallback } from 'react'
import type { GameState } from '../types'
import * as ipc from '../lib/ipc'

interface SavedGame {
  path: string
  character: string
  updated: string
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [currentPath, setCurrentPath] = useState<string | null>(null)
  const [savedGames, setSavedGames] = useState<SavedGame[]>([])
  const [loading, setLoading] = useState(false)

  const refreshSavedGames = useCallback(async () => {
    try {
      const games = await ipc.listGameFiles()
      setSavedGames(games)
      return games
    } catch {
      // electronAPI not available (dev mode in browser)
      return []
    }
  }, [])

  const createGame = useCallback(async (character: string) => {
    setLoading(true)
    try {
      const path = await ipc.createGameFile(character)
      const state = await ipc.readGameFile(path)
      setCurrentPath(path)
      setGameState(state)
      await refreshSavedGames()
    } finally {
      setLoading(false)
    }
  }, [refreshSavedGames])

  const switchGame = useCallback(async (path: string) => {
    setLoading(true)
    try {
      const state = await ipc.readGameFile(path)
      setCurrentPath(path)
      setGameState(state)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateGameState = useCallback((state: GameState) => {
    setGameState(state)
  }, [])

  return {
    gameState,
    currentPath,
    savedGames,
    loading,
    refreshSavedGames,
    createGame,
    switchGame,
    updateGameState
  }
}
