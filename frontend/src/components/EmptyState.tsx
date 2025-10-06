import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Button, Stack, Typography } from "@mui/material";

interface Props {
  onCreate: () => void;
}

const EmptyState = ({ onCreate }: Props) => (
  <Stack spacing={2} alignItems="center" sx={{ py: 10 }}>
    <Typography variant="h6" color="text.secondary">
      No contacts yet
    </Typography>
    <Button
      onClick={onCreate}
      variant="contained"
      startIcon={<AddRoundedIcon />}
    >
      Create your first contact
    </Button>
  </Stack>
);

export default EmptyState;
