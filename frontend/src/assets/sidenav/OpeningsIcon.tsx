interface OpeningsIconProps {
  className?: string
}

const OpeningsIcon: React.FC<OpeningsIconProps> = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Chess King Crown */}
    <path
      d="M5 16L4 20H20L19 16M5 16L7 8L9 10L12 7L15 10L17 8L19 16M5 16H19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="7" cy="6" r="1" fill="currentColor" />
    <circle cx="12" cy="4" r="1" fill="currentColor" />
    <circle cx="17" cy="6" r="1" fill="currentColor" />
  </svg>
)

export default OpeningsIcon
