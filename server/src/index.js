import { createApp } from './app.js';

const port = Number(process.env.PORT || 5000);
const app = createApp();

app.listen(port, () => {
  console.log(`AI Credit Builder Assistant API running on http://localhost:${port}`);
});
