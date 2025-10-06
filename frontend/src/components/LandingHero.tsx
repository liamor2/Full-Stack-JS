import { Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const LandingHero = () => (
  <Stack spacing={2}>
    <Typography
      variant="h2"
      component="h1"
      fontWeight={700}
      className="landing-title"
    >
      Seamless contact management
    </Typography>
    <Typography
      variant="h6"
      color="text.secondary"
      className="landing-subtitle"
    >
      Manage your personal and shared network in one intuitive dashboard.
    </Typography>
    <Button
      className="landing-cta"
      component={RouterLink}
      to="/login"
      size="large"
      variant="contained"
      sx={{ width: { xs: "100%", sm: "fit-content" } }}
    >
      Get Started
    </Button>
  </Stack>
);

export default LandingHero;
