// Premier League team logo mapping
// Logos will be stored in client/public/logos/teams/

export const TEAM_LOGO_MAP: Record<string, string> = {
  // Premier League Teams - mapped to actual file names
  "Arsenal": "Arsenal-FC-logo.png",
  "Arsenal FC": "Arsenal-FC-logo.png",
  "Aston Villa": "Aston-Villa-FC-logo.png",
  "Aston Villa FC": "Aston-Villa-FC-logo.png",
  "Bournemouth": "AFC-Bournemouth-logo.png",
  "AFC Bournemouth": "AFC-Bournemouth-logo.png",
  "Brentford": "Brentford-FC-logo.png",
  "Brentford FC": "Brentford-FC-logo.png",
  "Brighton": "Brighton-Hove-Albion-logo.png",
  "Brighton & Hove Albion": "Brighton-Hove-Albion-logo.png",
  "Brighton Hove Albion": "Brighton-Hove-Albion-logo.png",
  "Burnley": "Burnley-FC-logo.png",
  "Burnley FC": "Burnley-FC-logo.png",
  "Chelsea": "Chelsea-FC-logo.png",
  "Chelsea FC": "Chelsea-FC-logo.png",
  "Crystal Palace": "Crystal-Palace-FC-logo.png",
  "Crystal Palace FC": "Crystal-Palace-FC-logo.png",
  "Everton": "Everton-FC-logo.png",
  "Everton FC": "Everton-FC-logo.png",
  "Fulham": "Fulham-FC-logo.png",
  "Fulham FC": "Fulham-FC-logo.png",
  "Leeds United": "Leeds-United-FC-logo.png",
  "Leeds": "Leeds-United-FC-logo.png",
  "Liverpool": "Liverpool-FC-logo.png",
  "Liverpool FC": "Liverpool-FC-logo.png",
  "Manchester City": "Manchester-City-FC-logo.png",
  "Man City": "Manchester-City-FC-logo.png",
  "Manchester United": "Manchester-United-FC-logo.png",
  "Man United": "Manchester-United-FC-logo.png",
  "Man Utd": "Manchester-United-FC-logo.png",
  "Newcastle United": "Newcastle-United-logo.png",
  "Newcastle": "Newcastle-United-logo.png",
  "Nottingham Forest": "Nottingham-Forest-FC-logo.png",
  "Nottingham": "Nottingham-Forest-FC-logo.png",
  "Sunderland": "Sunderland-logo.png",
  "Tottenham": "Tottenham-Hotspur-logo.png",
  "Tottenham Hotspur": "Tottenham-Hotspur-logo.png",
  "Spurs": "Tottenham-Hotspur-logo.png",
  "West Ham": "West-Ham-United-FC-logo.png",
  "West Ham United": "West-Ham-United-FC-logo.png",
  "Wolverhampton": "Wolverhampton-Wanderers-logo.png",
  "Wolves": "Wolverhampton-Wanderers-logo.png",
  "Wolverhampton Wanderers": "Wolverhampton-Wanderers-logo.png",
};

/**
 * Get team logo URL from team name
 * Returns a placeholder if team not found
 */
export function getTeamLogo(teamName: string): string {
  const logoFile = TEAM_LOGO_MAP[teamName];
  
  if (logoFile) {
    return `/logos/${logoFile}`;
  }
  
  // Return Premier League logo as placeholder if team not found
  return `/logos/Premier-League-Logo.png`;
}

/**
 * Get team short name for display
 */
export function getTeamShortName(teamName: string): string {
  const shortNames: Record<string, string> = {
    "Manchester City": "Man City",
    "Manchester United": "Man Utd",
    "Tottenham Hotspur": "Tottenham",
    "Brighton & Hove Albion": "Brighton",
    "Wolverhampton Wanderers": "Wolves",
    "AFC Bournemouth": "Bournemouth",
    "Nottingham Forest": "Nottingham",
    "West Ham United": "West Ham",
    "Newcastle United": "Newcastle",
  };
  
  return shortNames[teamName] || teamName;
}
