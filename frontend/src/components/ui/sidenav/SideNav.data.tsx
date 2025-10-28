import {
  ChessIcon,
  CoachIcon,
  GameIcon,
  HistoryIcon,
  HomeIcon,
  OpeningsIcon,
  ProfileIcon,
  SettingsIcon,
  StatsIcon,
  TacticsIcon,
  TournamentIcon,
  TrainingIcon
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
    text: "Training",
    icon: <TrainingIcon />,
    link: "/training",
    children: [
      {
        id: "n31",
        text: "Chess Openings",
        icon: <OpeningsIcon />,
        link: "/training/openings"
      },
      {
        id: "n32",
        text: "Tactics and Traps",
        icon: <TacticsIcon />,
        link: "/training/tactics"
      },
      {
        id: "n33",
        text: "Play with Coach",
        icon: <CoachIcon />,
        link: "/training/coach"
      }
    ]
  },
  {
    id: "n4",
    text: "Statistics",
    icon: <StatsIcon />,
    link: "/statistics"
  },
  {
    id: "n5",
    text: "Profile",
    icon: <ProfileIcon />,
    link: "/profile",
    children: [
      {
        id: "n51",
        text: "Account Settings",
        icon: <SettingsIcon />,
        link: "/profile/settings"
      },
      {
        id: "n52",
        text: "Game Preferences",
        icon: <GameIcon />,
        link: "/profile/preferences"
      }
    ]
  },
  {
    id: "n6",
    text: "Settings",
    icon: <SettingsIcon />,
    link: "/settings"
  }
]
