import "./ConnectedHeader.scss"

import { useState } from "react"

import { mockNavData, SideNav } from "../ui/sidenav"
import type { IConnectedHeaderProps, IHamburgerMenuProps, IUserProfileProps } from "./ConnectedHeader.types"

const HamburgerMenu: React.FC<IHamburgerMenuProps> = ({ isOpen = false, onClick }) => (
  <button className="connected-header__hamburger" onClick={onClick} aria-label="Toggle menu">
    <div className={`connected-header__hamburger-line ${isOpen ? "connected-header__hamburger-line--open" : ""}`} />
    <div className={`connected-header__hamburger-line ${isOpen ? "connected-header__hamburger-line--open" : ""}`} />
    <div className={`connected-header__hamburger-line ${isOpen ? "connected-header__hamburger-line--open" : ""}`} />
  </button>
)

const UserProfile: React.FC<IUserProfileProps> = ({ user }) => {
  const getInitials = (username: string): string => {
    return username
      .split(" ")
      .map((name) => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("")
  }

  return (
    <div className="connected-header__user-profile">
      <span className="connected-header__username">{user.username}</span>
      <div className="connected-header__avatar">
        <span className="connected-header__avatar-text">{getInitials(user.username)}</span>
      </div>
    </div>
  )
}

const ConnectedHeader: React.FC<IConnectedHeaderProps> = ({
  user,
  onMenuToggle,
  appName = "Chess Game",
  navElements = mockNavData,
  onNavigate
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
    onMenuToggle?.()
  }

  const handleSideNavClose = () => {
    setIsMenuOpen(false)
  }

  const handleNavigate = (link: string) => {
    onNavigate?.(link)
    console.log("Navigating to:", link)
  }

  return (
    <>
      <header className="connected-header">
        <div className="connected-header__container">
          <div className="connected-header__left">
            <HamburgerMenu isOpen={isMenuOpen} onClick={handleMenuToggle} />
          </div>

          <div className="connected-header__center">
            <h1 className="connected-header__app-name">{appName}</h1>
          </div>

          <div className="connected-header__right">
            <UserProfile user={user} />
          </div>
        </div>
      </header>

      <SideNav navElements={navElements} isOpen={isMenuOpen} onClose={handleSideNavClose} onNavigate={handleNavigate} />
    </>
  )
}

export default ConnectedHeader
