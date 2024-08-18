require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v3 } = require('node-hue-api');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const LightState = v3.lightStates.LightState;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getLights() {
  const api = await v3.api.createLocal(process.env.BRIDGE_IP).connect(process.env.HUE_USERNAME);
  return api.lights.getAll();
}

app.get('/api/lights', async (req, res) => {
  try {
    const lights = await getLights();
    console.log('Lights data:', JSON.stringify(lights, null, 2));
    res.json(lights);
  } catch (error) {
    console.error('Error in /api/lights:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/lights/:id', async (req, res) => {
  try {
    console.log(`Attempting to update light ${req.params.id} with state:`, req.body);
    const result = await axiosWithRetry({
      method: 'put',
      url: `http://${process.env.BRIDGE_IP}/api/${process.env.HUE_USERNAME}/lights/${req.params.id}/state`,
      data: req.body
    });
    console.log(`Update result for light ${req.params.id}:`, result.data);
    res.json(result.data);
  } catch (error) {
    console.error(`Error updating light ${req.params.id}:`, error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

const axiosWithRetry = async (config, retries = 3, delay = 2000) => {
  try {
    await new Promise(resolve => setTimeout(resolve, delay));
    return await axios(config);
  } catch (error) {
    if (retries === 0) throw error;
    console.log(`Retrying request. Attempts left: ${retries - 1}`);
    return axiosWithRetry(config, retries - 1, delay * 2);
  }
};

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));