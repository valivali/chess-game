interface TacticsIconProps {
  className?: string
}

const TacticsIcon: React.FC<TacticsIconProps> = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Crossed swords */}
    <path
      d="M14.5 17.5L3 6L6 3L17.5 14.5M14.5 17.5L17.5 14.5M14.5 17.5L12 20L10 18L12.5 15.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 6.5L21 18L18 21L6.5 9.5M9.5 6.5L6.5 9.5M9.5 6.5L12 4L14 6L11.5 8.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default TacticsIcon
