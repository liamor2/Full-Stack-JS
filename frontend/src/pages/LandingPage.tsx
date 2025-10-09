import { useGSAP } from "@gsap/react";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import gsap from "gsap";
import { useRef } from "react";
import { Link as RouterLink } from "react-router-dom";

gsap.registerPlugin(useGSAP);

const heroLines = [
  "Organize your network",
  "Share contacts effortlessly",
  "Stay connected",
];

const LandingPage = () => {
  const theme = useTheme();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!rootRef.current) return;
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { duration: 0.8, ease: "power3.out" },
        });
        tl.from(".landing-title", { y: 40, opacity: 0 })
          .from(".landing-subtitle", { y: 20, opacity: 0 }, "-=0.6")
          .from(".landing-cta", { scale: 0.9, opacity: 0 }, "-=0.4")
          .from(
            ".landing-lines > *",
            {
              y: 10,
              opacity: 0,
              stagger: 0.2,
            },
            "-=0.5",
          );
      }, rootRef);
      return () => ctx.revert();
    },
    { scope: rootRef },
  );

  return (
    <Box
      ref={rootRef}
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: `radial-gradient(circle at top, ${alpha(theme.palette.primary.light, 0.25)}, ${theme.palette.background.default})`,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={6}>
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
              Manage your personal and shared network in one intuitive
              dashboard.
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

          <Stack className="landing-lines" spacing={1.5}>
            {heroLines.map((line) => (
              <Typography key={line} variant="body1" color="text.secondary">
                • {line}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default LandingPage;
