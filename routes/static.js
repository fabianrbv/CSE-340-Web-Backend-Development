const express = require('express');
const router = express.Router();
const path = require('path')

// Static Routes - use path.join to build absolute paths
router.use(express.static(path.join(__dirname, '..', 'public')));
router.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));
router.use('/js', express.static(path.join(__dirname, '..', 'public', 'js')));
router.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

// Serve a favicon if requested
router.get('/favicon.ico', (req, res) => {
	const faviconPath = path.join(__dirname, '..', 'public', 'images', 'site', 'favicon-32x32.png')
	res.sendFile(faviconPath)
})

module.exports = router;



