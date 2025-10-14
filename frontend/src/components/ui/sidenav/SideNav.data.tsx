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
    id: "elementA",
    text: "Dashboard",
    icon: <HomeIcon />,
    link: "/dashboard"
  },
  {
    id: "elementB",
    text: "Games",
    icon: <GameIcon />,
    link: "/games",
    children: [
      {
        id: "elementB1",
        text: "Quick Play",
        icon: <ChessIcon />,
        link: "/games/quick-play"
      },
      {
        id: "elementB2",
        text: "Tournaments",
        icon: <TournamentIcon />,
        link: "/games/tournaments"
      },
      {
        id: "elementB3",
        text: "Game History",
        icon: <HistoryIcon />,
        link: "/games/history"
      }
    ]
  },
  {
    id: "elementC",
    text: "Statistics",
    icon: <StatsIcon />,
    link: "/statistics"
  },
  {
    id: "elementD",
    text: "Profile",
    icon: <ProfileIcon />,
    link: "/profile",
    children: [
      {
        id: "elementD1",
        text: "Account Settings",
        icon: <SettingsIcon />,
        link: "/profile/settings"
      },
      {
        id: "elementD2",
        text: "Game Preferences",
        icon: <GameIcon />,
        link: "/profile/preferences"
      }
    ]
  },
  {
    id: "elementE",
    text: "Settings",
    icon: <SettingsIcon />,
    link: "/settings"
  }
]
