// contains list of origin that this server is willing to accept
const whiteList = [
  'https://blog-app-client-nine.vercel.app/',
  'https://blog-app-client-manager.vercel.app/',
];

exports.corsOptionDelegate = (req, callback) => {
  console.log('CORS');
  let corsOptions = {};
  // check if in request origin is there and if it is check present in whitelist
  if (whiteList.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};
