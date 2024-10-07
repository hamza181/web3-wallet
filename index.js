const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const port = 4000;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use(express.json());

// get payload from request body and create jwt token
app.post('/jwt', (req, res) => {
  const payload = req.body;
  const token = jwt.sign(payload
    , 'secret'
    , { expiresIn: '1h' });
  res.json({ token });
}
);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});