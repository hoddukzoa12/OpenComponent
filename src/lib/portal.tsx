import { createContext, useContext } from 'react'
export const ProjectPortal = createContext<HTMLElement | undefined>(undefined)
export function useProjectPortal() {
  return useContext(ProjectPortal)
}
// Optional simulated viewport. Standalone components retain normal media queries.
export const ProjectViewport = createContext<number | undefined>(undefined)
export function useProjectViewport() {
  return useContext(ProjectViewport)
}
