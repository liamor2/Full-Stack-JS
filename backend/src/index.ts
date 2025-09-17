import express from 'express';
import { greet, VERSION } from '@full-stack-js/shared';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.json({ message: greet('World'), sharedVersion: VERSION });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
