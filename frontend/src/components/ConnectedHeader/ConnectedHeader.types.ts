import type { User } from "../../types/user.types"
import type { INavElement } from "../ui/sidenav"

export interface IConnectedHeaderProps {
  user: User
  onMenuToggle?: () => void
  appName?: string
  navElements?: INavElement[]
  onNavigate?: (link: string) => void
}

export interface IUserProfileProps {
  user: User
}

export interface IHamburgerMenuProps {
  isOpen?: boolean
  onClick?: () => void
}
