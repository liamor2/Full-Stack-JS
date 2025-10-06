import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { AppBar, Toolbar, Typography, IconButton, Button } from "@mui/material";

interface Props {
  greeting: string;
  onLogout: () => void;
  onAdd: () => void;
  pending?: boolean;
}

const DashboardHeader = ({
  greeting,
  onLogout,
  onAdd,
  pending = false,
}: Props) => (
  <AppBar
    position="static"
    color="transparent"
    elevation={0}
    sx={{ borderBottom: 1, borderColor: "divider" }}
  >
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
        Contact Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
        {greeting}
      </Typography>
      <IconButton color="inherit" onClick={onLogout} aria-label="Logout">
        <LogoutRoundedIcon />
      </IconButton>
      <Button
        variant="contained"
        startIcon={<AddRoundedIcon />}
        onClick={onAdd}
        disabled={pending}
        sx={{ ml: 2 }}
      >
        Add contact
      </Button>
    </Toolbar>
  </AppBar>
);

export default DashboardHeader;
