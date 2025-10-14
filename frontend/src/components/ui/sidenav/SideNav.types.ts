import type { ReactNode } from "react"

export interface INavElement {
  id: string
  text: string
  icon: ReactNode
  link: string
  children?: INavElement[]
}

export interface ISideNavProps {
  navElements: INavElement[]
  isOpen: boolean
  onClose: () => void
  onNavigate?: (link: string) => void
}

export interface INavItemProps {
  element: INavElement
  level: number
  onNavigate?: (link: string) => void
  isMobile: boolean
}

export interface INavState {
  openParentId: string | null
  navigationHistory: string[]
}
