interface CoachIconProps {
  className?: string
}

const CoachIcon: React.FC<CoachIconProps> = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Graduation cap */}
    <path d="M22 10L12 5L2 10L12 15L22 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M6 12V16C6 17.1046 8.68629 19 12 19C15.3137 19 18 17.1046 18 16V12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M22 10V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default CoachIcon
