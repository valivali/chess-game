import "./SideNav.scss"

import { useEffect, useRef, useState } from "react"

import { ArrowIcon, BackIcon, CloseIcon } from "../../../assets/sidenav"
import type { INavItemProps, ISideNavProps } from "./SideNav.types"

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)

    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

const NavItem: React.FC<INavItemProps> = ({ element, level, onNavigate, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isChildrenOpen, setIsChildrenOpen] = useState(false)
  const [submenuTop, setSubmenuTop] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const hasChildren = element.children && element.children.length > 0

  const handleClick = () => {
    if (hasChildren && isMobile) {
      setIsChildrenOpen(true)
    } else {
      onNavigate?.(element.link)
    }
  }

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true)
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setSubmenuTop(rect.top)
      }
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false)
    }
  }

  return (
    <div className="sidenav__item-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button ref={buttonRef} className={`sidenav__item sidenav__item--level-${level}`} onClick={handleClick}>
        <div className="sidenav__item-content">
          <span className="sidenav__icon">{element.icon}</span>
          <span className="sidenav__text">{element.text}</span>
        </div>
        {hasChildren && <ArrowIcon isOpen={isHovered || isChildrenOpen} />}
      </button>

      {hasChildren && !isMobile && isHovered && (
        <div className="sidenav__submenu sidenav__submenu--desktop" style={{ top: submenuTop }}>
          {element.children!.map((child) => (
            <NavItem key={child.id} element={child} level={level + 1} onNavigate={onNavigate} isMobile={isMobile} />
          ))}
        </div>
      )}

      {hasChildren && isMobile && isChildrenOpen && (
        <div className="sidenav__submenu sidenav__submenu--mobile">
          <button className="sidenav__back-button" onClick={() => setIsChildrenOpen(false)}>
            <BackIcon />
            <span>Back to {element.text}</span>
          </button>
          {element.children!.map((child) => (
            <NavItem key={child.id} element={child} level={level + 1} onNavigate={onNavigate} isMobile={isMobile} />
          ))}
        </div>
      )}
    </div>
  )
}

const SideNav: React.FC<ISideNavProps> = ({ navElements, isOpen, onClose, onNavigate }) => {
  const isMobile = useMobileDetection()

  const handleNavigate = (link: string) => {
    onNavigate?.(link)
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)

      if (isMobile) {
        document.body.style.overflow = "hidden"
      }
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, isMobile, onClose])

  return (
    <>
      {isOpen && isMobile && <div className="sidenav__overlay" onClick={handleOverlayClick} />}

      <nav className={`sidenav ${isOpen ? "sidenav--open" : ""} ${isMobile ? "sidenav--mobile" : "sidenav--desktop"}`}>
        <div className="sidenav__header">
          <h2 className="sidenav__title">Navigation</h2>
          <button className="sidenav__close-button" onClick={onClose} aria-label="Close navigation">
            <CloseIcon />
          </button>
        </div>

        <div className="sidenav__content">
          {navElements.map((element) => (
            <NavItem key={element.id} element={element} level={0} onNavigate={handleNavigate} isMobile={isMobile} />
          ))}
        </div>
      </nav>
    </>
  )
}

export default SideNav
