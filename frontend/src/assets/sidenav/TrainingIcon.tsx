interface TrainingIconProps {
  className?: string
}

const TrainingIcon: React.FC<TrainingIconProps> = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 21L9.09 17.26L16 16.5L9.09 15.74L8 12L6.91 15.74L0 16.5L6.91 17.26L8 21Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 12L21.09 8.26L28 7.5L21.09 6.74L20 3L18.91 6.74L12 7.5L18.91 8.26L20 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default TrainingIcon
