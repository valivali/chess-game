import {
  ChessIcon,
  GameIcon,
  HistoryIcon,
  HomeIcon,
  ProfileIcon,
  SettingsIcon,
  StatsIcon,
  TournamentIcon
} from "../../../assets/sidenav"
import type { INavElement } from "./SideNav.types"

export const mockNavData: INavElement[] = [
  {
    id: "n1",
    text: "Dashboard",
    icon: <HomeIcon />,
    link: "/dashboard"
  },
  {
    id: "n2",
    text: "Games",
    icon: <GameIcon />,
    link: "/games",
    children: [
      {
        id: "n21",
        text: "Quick Play",
        icon: <ChessIcon />,
        link: "/games/quick-play"
      },
      {
        id: "n22",
        text: "Tournaments",
        icon: <TournamentIcon />,
        link: "/games/tournaments"
      },
      {
        id: "n23",
        text: "Game History",
        icon: <HistoryIcon />,
        link: "/games/history"
      }
    ]
  },
  {
    id: "n3",
    text: "Statistics",
    icon: <StatsIcon />,
    link: "/statistics"
  },
  {
    id: "n4",
    text: "Profile",
    icon: <ProfileIcon />,
    link: "/profile",
    children: [
      {
        id: "n41",
        text: "Account Settings",
        icon: <SettingsIcon />,
        link: "/profile/settings"
      },
      {
        id: "n42",
        text: "Game Preferences",
        icon: <GameIcon />,
        link: "/profile/preferences"
      }
    ]
  },
  {
    id: "n5",
    text: "Settings",
    icon: <SettingsIcon />,
    link: "/settings"
  }
]
