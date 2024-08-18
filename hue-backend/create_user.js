const v3 = require('node-hue-api').v3;
const discovery = v3.discovery;
const hueApi = v3.api;

const appName = 'node-hue-api';
const deviceName = 'example-code';

async function discoverBridge() {
  const discoveryResults = await discovery.nupnpSearch();
  
  if (discoveryResults.length === 0) {
    console.error('Failed to resolve any Hue Bridges');
    return null;
  } else {
    return discoveryResults[0].ipaddress;
  }
}

async function createUser(ipAddress) {
  const unauthenticatedApi = await hueApi.createLocal(ipAddress).connect();
  
  console.log('Appuyez sur le bouton de liaison de votre bridge Philips Hue maintenant.');
  console.log('Vous avez 30 secondes...');

  // Attendre 30 secondes
  await new Promise(resolve => setTimeout(resolve, 30000));

  try {
    const createdUser = await unauthenticatedApi.users.createUser(appName, deviceName);
    console.log('*******************************************************************************\n');
    console.log('User has been created on the Hue Bridge. The following username can be used to\n' +
                'authenticate with the Bridge and provide full local access to the Hue Bridge.\n' +
                'YOU SHOULD TREAT THIS LIKE A PASSWORD\n');
    console.log(`Hue Bridge User: ${createdUser.username}`);
    console.log(`Hue Bridge User Client Key: ${createdUser.clientkey}`);
    console.log('*******************************************************************************\n');

    return createdUser.username;
  } catch(err) {
    if (err.getHueErrorType() === 101) {
      console.error('Le bouton de liaison n\'a pas été pressé. Veuillez réessayer.');
    } else {
      console.error(`Erreur inattendue: ${err.message}`);
    }
    return null;
  }
}

async function main() {
  const ipAddress = await discoverBridge();
  if (ipAddress) {
    console.log(`Bridge trouvé à l'adresse: ${ipAddress}`);
    const username = await createUser(ipAddress);
    if (username) {
      console.log('Utilisez ce nom d\'utilisateur dans votre fichier .env :');
      console.log(`HUE_USERNAME=${username}`);
    }
  } else {
    console.log('Aucun bridge trouvé, veuillez vérifier votre connexion réseau.');
  }
}

main().then(() => console.log('Terminé'));