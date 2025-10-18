import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"

export const formatTimeAgo = (date: Date): string => {
  const now = new Date()

  if (date > now) {
    return "Just now"
  }

  const distance = formatDistanceToNow(date, { addSuffix: true })

  if (distance.includes("less than a minute")) {
    return "Just now"
  }

  return distance
    .replace("about ", "")
    .replace(" ago", " ago")
    .replace("minute", "m")
    .replace("minutes", "m")
    .replace("hour", "h")
    .replace("hours", "h")
    .replace("day", "d")
    .replace("days", "d")
}

export const formatDateForDisplay = (date: Date): string => {
  if (isToday(date)) {
    return "Today"
  }

  if (isYesterday(date)) {
    return "Yesterday"
  }

  const daysDiff = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff < 7) {
    return `${daysDiff} days ago`
  }

  return format(date, "MMM d, yyyy")
}

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}
