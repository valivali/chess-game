interface ArrowIconProps {
  isOpen: boolean
}

const ArrowIcon = ({ isOpen }: ArrowIconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={`sidenav__arrow ${isOpen ? "sidenav__arrow--open" : ""}`}
  >
    <polyline points="9,18 15,12 9,6" />
  </svg>
)

export default ArrowIcon
